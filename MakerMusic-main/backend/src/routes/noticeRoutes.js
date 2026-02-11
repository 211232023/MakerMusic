const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, noticeController.getNotices);
router.post('/', authMiddleware, noticeController.createNotice);
router.put('/:id', authMiddleware, noticeController.updateNotice);
router.delete('/:id', authMiddleware, noticeController.deleteNotice);
router.patch('/:id/pin', authMiddleware, noticeController.togglePin);

module.exports = router;
