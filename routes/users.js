const express = require('express');
const router = express.Router();
const journal_controller = require('../controllers/journal_controller');
const user_controller = require('../controllers/user_controller');


router.get('/', user_controller.get_user_info);

router.get('/privatejournals', journal_controller.get_private_journals);

router.get('/privatejournals/:id', journal_controller.get_journal_info);

router.delete('/privatejournals/:id/delete', journal_controller.delete_journal);

router.put('/updatejournal/:id', journal_controller.update_journal);

router.post('/createjournal', journal_controller.create_private_journal);

router.post('/changepassword', user_controller.change_password);

router.delete('/account/delete', user_controller.delete_account);


module.exports = router;
