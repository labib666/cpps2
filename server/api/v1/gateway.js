const express = require('express');
const Gate = require('mongoose').model('Gate');
const User = require('mongoose').model('User');
// const ojnames = require('models').ojInfo;
// const rootStr = '000000000000000000000000';
// const marked = require('marked');
// const escapeLatex = require('escapeLatex');
// const async = require('async');
// const {usersThatSolved} = require('./otherController.js');

const router = express.Router();

router.post('/gateway', postAddItem);
// router.post('/edit-item', isAdmin, post_editItem);
// router.post('/delete-item/:id', isRoot, post_deleteItem_Id);
// router.get('/read-item/:id', get_readItem_Id);

module.exports = {
  addRouter(app) {
    app.use('/gateway', router);
  },
};

/**
 *Implementation
 */

// function get_editItem_Id(req, res, next) {
//   const id = req.params.id;
//   Gate.findOne({
//       _id: id
//     })
//     .exec(function(err, item) {
//       if (err) return next(err);
//       if (!item) {
//         req.flash('error', 'No such item found for edit');
//         return res.redirect('/gateway');
//       }
//       return res.render( 'gateway/editItem', {
//         item,
//         ojnames
//       });
//     });
// }

// function syncModel(target, source, session) {
//   target.type = source.type;
//   target.parentId = source.parentId;
//   target.ind = source.ind;
//   target.title = source.title;
//   target.body = source.body;
//   target.platform = source.platform;
//   target.pid = source.pid;
//   target.link = source.link;
//   // target.createdBy = session.username; // Only during creation
//   target.lastUpdatedBy = session.username;
// }

// For a given {ojname, pid} pair, find all users that solved the problems
async function usersThatSolved(ojname, problemId) {
  try {
    const userList = await User.find({
      ojStats: {
        $elemMatch: {
          ojname,
          solveList: problemId,
        },
      },
    }, {_id: 1}).exec();
    return userList.map((x)=> x._id);
  } catch (err) {
    throw err;
  }
}

async function postAddItem(req, res, next) {
  const item = {...req.body};
  item.lastUpdatedBy = req.session.username;
  item.createdBy = req.session.username;
  item.parentId = req.params.parentId;

  if (item.type === 'folder') {
    delete item.body;
    delete item.platform;
    delete item.pid;
    delete item.link;
  }

  // Need to calculate the ancestor of this item.
  // For that we need ancestor list of the parent

  try {
    const x = await Gate.findOne({_id: item.parentId}).select('ancestor').exec();
    if (!x) {
      return next({
        status: 400,
        message: `BADPARENTID: Parent Id note found ${item.parentId}.`,
      });
    }
    item.ancestor = x.ancestor.concat(item.parentId);

    if (item.type === 'problem') {
      item.doneList = await usersThatSolved(item.platform, item.pid);
    }

    // Ready to save our item
    const itemModel = new Gate(item);
    // Need to ensure uniquensess of problem
    if (itemModel.type.toString() === 'problem') {
      const oldDoc = await Gate.findOneAndUpdate({
        platform: itemModel.platform,
        pid: itemModel.pid,
      }, {
        $setOnInsert: itemModel, // Sets only if upsert inserts a new document
      }, {
        upsert: true,
        fields: '_id',
      }).exec();

      if (oldDoc) {
        return next({
          status: 400,
          message: 'DUPPID Problem already exists.',
        });
      }
    } else {
      await itemModel.save();
    }

    return res.status(201).json({
      status: 201,
      message: 'Problem successfully inserted.',
    });
  } catch (err) {
    return next(err);
  }
}

// function addUniqueProblem(itemModel, callback) {
//   /* Adds item to db
//
//   @callback (err, oldDoc)
//   */
//   Gate.findOneAndUpdate({
//     platform: itemModel.platform,
//     pid: itemModel.pid
//   }, {
//     $setOnInsert: itemModel // Sets only if upsert inserts a new document
//   }, {
//     upsert: true,
//     fields: '_id'
//   }).exec(callback);
// }
//
// function post_editItem(req, res, next) {
//   const id = req.body.id;
//   ///Need to calculate the ancestor of this item.
//   ///For that we need ancestor list of the parent
//
//   Gate.findOne({
//     _id: id
//   }).exec(function(err, item) {
//     if (err) return next(err);
//     if (!item) {
//       req.flash('error', 'No such item found for edit');
//       return res.redirect(`/gateway/get-children/${rootStr}`);
//     }
//
//     if (item.type.toString() !== req.body.type){
//       req.flash('error', 'Item type cannot be changed');
//       return res.redirect(`/gateway/edit-item/${id}`);
//     }
//
//     const original = {};
//     syncModel(original, item, req.session);
//     syncModel(item, req.body, req.session);
//
//     // Update ancestor if necessary
//     if (original.parentId.toString() !== req.body.parentId) {
//       return updateAncestorOfItem(saveItemWithProperAncestor);
//     } else {
//       return saveItemWithProperAncestor();
//     }
//
//     function updateAncestorOfItem(saveItemWithProperAncestor) {
//       Gate.findOne({
//           _id: item.parentId
//         })
//         .select('ancestor')
//         .exec(function(err, x) {
//           if (err) return next(err);
//           if (!x) {
//             req.flash('error', `No such parent with id ${item.parentId}`);
//             return res.redirect(`/gateway/edit-item/${id}`);
//           }
//
//           /** Folders are simple. It is safe to modify them anyway we want
//               The followin block updates the ancestor and saves our item
//           */
//           if (original.type.toString() === 'folder') {
//             async.series([ ///Fix subtree
//               function(callback) {
//                 fixAncestorOfNode(req, x, item, callback);
//               }
//             ], function(err) {
//               if (err) return next(err);
//               req.flash('success', 'Edit Successful');
//               return res.redirect(`/gateway/get-children/${item.parentId}`);
//             });
//           } else { //If not folder, then we simply update item's ancestor and continue modification
//             item.ancestor = x.ancestor.concat(x._id); //Update ancestor
//             return saveItemWithProperAncestor();
//           }
//         });
//     }
//
//     function saveItemWithProperAncestor() {
//       if (item.type.toString() === 'folder') {
//         return justSaveItem();
//       } else {
//         if (original.platform !== item.platform.toString() ||
//           original.pid !== item.pid.toString()
//         ) { //Problem ID is being changed. Need to ensure uniquensess
//           const toBeDeleted = item._id;
//           item.createdAt = item.updatedAt = item._id = undefined;
//           return addUniqueProblem(item,function(err,oldDoc){
//             if ( err ) return next(err);
//             if (oldDoc) { //Some doc already exists
//               req.flash('error', 'Problem already exists');
//               return res.redirect(`/gateway/edit-item/${toBeDeleted}`);
//             } else {
//               req.flash('success', 'Problem successfully inserted');
//               // Delete the old one before moving on
//               deleteItem(toBeDeleted,function(err){
//                 if ( err ) {
//                   //TODO: Log this somewhere. Failed to delete this item
//                   req.flash('error', 'Failed to remove previous item')
//                 }
//                 req.flash('success', 'Successfully removed previous item');
//                 return res.redirect(`/gateway/get-children/${item.parentId}`);
//               })
//             }
//           });
//         } else { // Ancestor is ok. Problem ID is ok.
//           return justSaveItem();
//         }
//       }
//     }
//
//     function justSaveItem() {
//       item.save(req, function(err) {
//         if (err) return next(err);
//         req.flash('success', 'Edit Successful');
//         return res.redirect(`/gateway/get-children/${item.parentId}`);
//       });
//     }
//   });
//
//   function fixAncestorOfNode(req, parent, node, done) {
//     /** A recursive function to update ancestor of a subtree
//
//         Useful when relocating folders
//
//         First you need to choose a node and update its parent. Then calling this
//         function will update the subtree.
//     */
//     node.ancestor = parent.ancestor.concat(parent._id); //Update ancestor
//     node.save(req, function(err) { //Save node
//       if (err) return done(err);
//       Gate.find({ ///Update children
//         parentId: node._id
//       }).exec(function(err, items) {
//         if (err) return done(err);
//         async.forEach(items, function(item, itemCB) {
//           fixAncestorOfNode(req, node, item, itemCB);
//         }, function(err) {
//           if (err) return done(err);
//           return done();
//         });
//       });
//     });
//   }
// }
//
// function deleteItem(itemId, callback){
//   /* Deletes the item with @itemId provided
//
//   @callback (err)
//   */
//   Gate.findOne({
//       _id: itemId
//     })
//     .remove()
//     .exec(callback);
// }
//
// function post_deleteItem_Id(req, res, next) {
//   const id = req.params.id;
//   const parentId = req.body.parentId;
//   if (req.body.delete !== 'Delete') {
//     req.flash('error', 'Wrong word typed during Delete');
//     return res.redirect(`gateway/edit-item/${id}`);
//   }
//
//   // TODO: cpps Issue 29
//   deleteItem(id,function(err) {
//     if (err) return next(err);
//     req.flash('success', 'Successfully deleted');
//     return res.redirect(`/gateway/get-children/${parentId}`);
//   })
// }
//
// function get_readItem_Id(req, res, next) {
//   const id = req.params.id;
//
//   Gate.findOne({
//       _id: id
//     })
//     .select('title body parentId')
//     .exec(function(err, item) {
//       if (err) return next(err);
//       if (!item) {
//         req.flash('No item with such id');
//         return res.redirect(`/gateway/get-children/${rootStr}`);
//       }
//
//       item.body = escapeLatex(item.body);
//       marked(item.body, function(err, content) {
//         if (err) return next(err);
//         item.body = content;
//         return res.render('gateway/readItem', {
//           item
//         });
//       });
//     });
// }
