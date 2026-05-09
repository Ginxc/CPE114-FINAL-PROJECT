const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

router.get('/', enrollmentController.getAllEnrollments);
router.post('/enroll', enrollmentController.enrollStudent);
router.get('/student/:studentId', enrollmentController.getStudentEnrollments);
router.put('/drop/:studentId/:subjectId', enrollmentController.dropEnrollment);
router.put('/grade/:studentId/:subjectId', enrollmentController.updateGrade);

module.exports = router;