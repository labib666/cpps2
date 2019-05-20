const express = require('express');
const Gate = require('../../models/gateModel');
const User = require('../../models/userModel');
const {data: ojInfo} = require('models').ojInfo;
const {isAdmin} = require('middlewares/userGroup');

const router = express.Router();

router.get('/gateway-root', getRoot);
router.get('/gateway', getItems);

router.get('/gateway/:_id/content', getItems);
router.post('/gateway/:_id/content', isAdmin, postAddItem);

router.get('/gateway/:_id', getItem);
router.delete('/gateway/:_id', isAdmin, deleteItem);

module.exports = {
  addRouter(app) {
    app.use('/api/v1', router);
  },
};

/**
 *Implementation
 */

// For a given {ojname, pid} pair, find all users that solved the problems
async function usersThatSolved(ojname, problemId) {
  try {
    const userList = await User.find(
      {
        ojStats: {
          $elemMatch: {
            ojname,
            solveList: problemId,
          },
        },
      },
      {_id: 1}
    ).exec();
    return userList.map((x) => x._id);
  } catch (err) {
    throw err;
  }
}

// async function setFolderStat(folder, username) {
//   try {
//     const totalProblems = await Gate.count({
//       ancestor: folder._id,
//       type: 'problem',
//     }).exec();

//     const userSolved = await Gate.count({
//       ancestor: folder._id,
//       type: 'problem',
//       doneList: username,
//     });

//     folder.total = totalProblems;
//     folder.user = userSolved;
//   } catch (err) {
//     throw err;
//   }
// }

async function postAddItem(req, res, next) {
  /**
   * Validation Gateway Schema
   * type: Validated on Model through enum
   * parentId: Validated when setting ancestor below
   * ancestor: autogenerated
   * ind: Validated on model: number and required
   * title: Validated on model: string and required
   * body: optional string
   * platform: validated as enum on model
   * pid: validated during finding 'usersThatSolved'
   * link: validated on model
   * doneList: autogenerated
   * createdBy: autogenerated
   * lastUpdatedBy: autogenerated
   */

  const item = {...req.body, parentId: req.params._id};
  item.lastUpdatedBy = req.session.username;
  item.createdBy = req.session.username;

  if (item.type === 'folder') {
    delete item.body;
    delete item.platform;
    delete item.pid;
    delete item.link;
  }

  // Need to calculate the ancestor of this item.
  // For that we need ancestor list of the parent

  try {
    const x = await Gate.findOne({_id: item.parentId})
      .select('ancestor')
      .exec();
    if (!x) {
      return next({
        status: 400,
        message: `BADPARENTID: Parent Id not found ${item.parentId}.`,
      });
    }
    item.ancestor = x.ancestor.concat(item.parentId);

    if (item.type === 'problem') {
      const {platform, pid} = item;
      if (ojInfo[platform] === undefined) {
        return next({
          status: 400,
          message: `BADPARAM No such platform ${platform}.`,
        });
      }
      const regex = new RegExp(ojInfo[platform].pattern, 'g');
      if (pid === '' || regex.test(pid) === false) {
        return next({
          status: 400,
          message: `BADPARAM Invalid Problem ID.`,
        });
      }
      item.doneList = await usersThatSolved(item.platform, item.pid);
    }

    // Ready to save our item
    const itemModel = new Gate(item);
    const data = await itemModel.save();

    const dataWithStats = await getItemStats(data, req.session);
    return res.status(201).json({
      status: 201,
      message: 'Item inserted successfully.',
      data: dataWithStats,
    });
  } catch (err) {
    if (err.code === 11000 && err.message.includes('platform_1_pid_1')) {
      return next({
        status: 400,
        message: 'DUPPID Problem already exists.',
      });
    }
    return next(err);
  }
}

async function getItemStats(item, session = {}) {
  if (item.type.toString() === 'folder') {
    return await getFolderItemStats(item, session);
  } else if (item.type.toString() === 'problem') {
    return await getProblemItemStats(item, session);
  } else {
    throw new Error('Not a folder or Problem');
  }
}

// Set stats about how many problems are inside the folder and how many user has solved
async function getFolderItemStats(item, session) {
  try {
    const totalCountPromise = Gate.count({
      ancestor: item._id,
      type: {
        $in: ['problem', 'text'],
      },
    }).exec();

    const userCountPromise = session.login
      ? Gate.count({
          ancestor: item._id,
          type: {
            $in: ['problem', 'text'],
          },
          doneList: session.username,
        }).exec()
      : -1;

    const [totalCount, userCount] = await Promise.all([
      totalCountPromise,
      userCountPromise,
    ]);
    return {...item._doc, totalCount, userCount};
  } catch (err) {
    throw err;
  }
}

// Set stats about how many users solved this particular problem
async function getProblemItemStats(item, session) {
  try {
    const result = await Gate.aggregate([
      {
        $match: {
          _id: item._id,
        },
      },
      {
        $project: {
          userSolved: {
            $size: '$doneList',
          },
        },
      },
    ]).exec();
    return {...item._doc, userSolved: result[0].userSolved};
  } catch (err) {
    throw err;
  }
}

async function getRoot(req, res, next) {
  if (req.query.space) {
    // TODO implement after introducing spaces
    return res.status(200).json({
      status: 200,
      data: Gate.getRoot(),
    });
  } else {
    return res.status(200).json({
      status: 200,
      data: Gate.getRoot(),
    });
  }
}

async function getItems(req, res, next) {
  const query = {};
  if (req.params._id) query.parentId = req.params._id;
  if (req.query.type) query.type = req.query.type;

  try {
    // Need all items whose parent is parentId.
    const children = await Gate.find(query).exec();

    if (req.query.childStat === 'true') {
      const childrenStatsPromise = children.map((item) => {
        return getItemStats(item, req.session);
      });
      const childrenWithStats = await Promise.all(childrenStatsPromise);
      return res.status(200).json({
        status: 200,
        data: childrenWithStats,
      });
    } else {
      return res.status(200).json({
        status: 200,
        data: children,
      });
    }
  } catch (err) {
    return next(err);
  }
}

async function getItem(req, res, next) {
  const {_id} = req.params;

  try {
    const item = await Gate.findOne({_id}).exec();
    return res.status(200).json({
      status: 200,
      data: item,
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteItem(req, res, next) {
  const {_id} = req.params;

  try {
    // Check if the item is folder. If folders have item in them, they cannot be
    // deleted.
    const count = await Gate.count({parentId: _id}).exec();
    if (count > 0) {
      return next({
        status: 400,
        message: `Cannot delete folder: ${_id} with ${count} item(s) inside it.`,
      });
    }

    await Gate.deleteOne({_id}).exec();
    return res.status(201).json({
      status: 201,
    });
  } catch (err) {
    return next(err);
  }
}
