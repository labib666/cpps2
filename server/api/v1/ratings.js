const express = require('express');
const {isRoot} = require('middlewares/userGroup');
const Classroom = require('../../models/classroomModel');
const Rating = require('../../models/ratingModel');
const Standing = require('../../models/standingModel');

const router = express.Router();

router.get('/ratings', getRatings);
router.put('/ratings', isRoot, applyRating);

module.exports = {
  addRouter(app) {
    app.use('/api/v1', router);
  },
};

async function getRatings(req, res, next) {
  try {
    const {classroomId} = req.query;
    const studentList = await Classroom.findById(classroomId)
      .select('students')
      .exec();
    const userIds = studentList.students;
    if (!classroomId || !userIds || !userIds[0]) {
      const e = new Error(
        `classroomId: ${classroomId} or userIds: ${userIds} query is missing`);
      e.status = 400;
      throw e;
    }

    const rating = await Rating.find({classroomId, userId: userIds}).exec();

    const missingIds = userIds.filter((id)=>{
      const found = rating.some((x)=> x.userId.toString() === id);
      return !found;
    });

    missingIds.forEach((id)=>{
      rating.push({
        userId: id,
        classroomId,
        currentRating: -1,
      });
    });
    return res.status(200).json({
      status: 200,
      data: rating,
    });
  } catch (err) {
    next(err);
  }
}

async function applyRating(req, res, next) {
  try {
    const {contestId} = req.body;
    const {userId} = req.session;

    // Get rating changes due to contestId
    const standing = await Standing.find({
      contestId,
      coach: userId,
    }).exec();

    await Promise.all(standing.map(async (s)=>{
      await Rating.findOneAndUpdate({
        userId: s.userId,
        classroomId: s.classroomId,
      }, {
        $set: {
          userId: s.userId,
          classroomId: s.classroomId,
          currentRating: s.newRating,
        },
      }, {
        upsert: true,
      });
    }));

    return res.status(200).json({
      status: 200,
    });
  } catch (err) {
    next(err);
  }
}
