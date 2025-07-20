const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let testThreadId;
  let testReplyId;
  const board = "testboard";

  let threadPassword = "pass123";
  let replyPassword = "replypass";

  suite("API ROUTING FOR /api/threads/:board", function () {
    test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
      chai
        .request(server)
        .post(`/api/threads/${board}`)
        .send({
          text: "Test thread",
          delete_password: threadPassword,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
      chai
        .request(server)
        .get(`/api/threads/${board}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length, 10);
          const thread = res.body[0];
          assert.property(thread, "_id");
          assert.property(thread, "text");
          assert.property(thread, "created_on");
          assert.property(thread, "bumped_on");
          assert.property(thread, "replies");
          assert.isArray(thread.replies);
          assert.isAtMost(thread.replies.length, 3);
          testThreadId = thread._id; // Save for later use
          done();
        });
    });

    test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board}", function (done) {
      chai
        .request(server)
        .delete(`/api/threads/${board}`)
        .send({
          thread_id: testThreadId,
          delete_password: "wrongpass",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });

    test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
      chai
        .request(server)
        .put(`/api/threads/${board}`)
        .send({
          thread_id: testThreadId,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "reported");
          done();
        });
    });

    test("Deleting a thread with the correct password: DELETE request to /api/threads/{board}", function (done) {
      chai
        .request(server)
        .delete(`/api/threads/${board}`)
        .send({
          thread_id: testThreadId,
          delete_password: threadPassword,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function () {
    let replyThreadId;

    // Create a thread to add replies to
    before(function (done) {
      chai
        .request(server)
        .post(`/api/threads/${board}`)
        .send({
          text: "Thread for replies",
          delete_password: "replyThreadPass",
        })
        .end((err, res) => {
          chai
            .request(server)
            .get(`/api/threads/${board}`)
            .end((err, res) => {
              replyThreadId = res.body[0]._id;
              done();
            });
        });
    });

    test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
      chai
        .request(server)
        .post(`/api/replies/${board}`)
        .send({
          thread_id: replyThreadId,
          text: "This is a reply",
          delete_password: replyPassword,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function (done) {
      chai
        .request(server)
        .get(`/api/replies/${board}`)
        .query({ thread_id: replyThreadId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "_id");
          assert.property(res.body, "text");
          assert.isArray(res.body.replies);
          assert.isAtLeast(res.body.replies.length, 1);
          testReplyId = res.body.replies[0]._id; // Save for later tests
          done();
        });
    });

    test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board}", function (done) {
      chai
        .request(server)
        .delete(`/api/replies/${board}`)
        .send({
          thread_id: replyThreadId,
          reply_id: testReplyId,
          delete_password: "wrongpass",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });

    test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
      chai
        .request(server)
        .put(`/api/replies/${board}`)
        .send({
          thread_id: replyThreadId,
          reply_id: testReplyId,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "reported");
          done();
        });
    });

    test("Deleting a reply with the correct password: DELETE request to /api/replies/{board}", function (done) {
      chai
        .request(server)
        .delete(`/api/replies/${board}`)
        .send({
          thread_id: replyThreadId,
          reply_id: testReplyId,
          delete_password: replyPassword,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
    });
  });
});
