const threadController = require("../controllers/threadController");
const replyController = require("../controllers/replyController");

module.exports = function (app) {
  // THREAD ROUTES
  app
    .route("/api/threads/:board")
    .post(threadController.createThread)
    .get(threadController.getThreads)
    .delete(threadController.deleteThread)
    .put(threadController.reportThread);

  // REPLY ROUTES
  app
    .route("/api/replies/:board")
    .post(replyController.createReply)
    .get(replyController.getThreadWithReplies)
    .delete(replyController.deleteReply)
    .put(replyController.reportReply);
};
