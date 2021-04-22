const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
chai.use(chaiHttp);

suite('Functional Tests', () => {
	suite("Integration test with chai-http", () => {

		// Declaring test id to use it later in updating and deleting
		let test_id;

		// #1
		test("Create an issue with every field: POST request to /api/issues/{project}", done => {
			chai.request(server)
				.post("/api/issues/apitest")
				.send({
					issue_title: "Test1",
					issue_text: "This is first test - Create an issue with every field",
					created_by: "Arman",
					assigned_to: "test team",
					status_text: "testing"
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.issue_title, 'Test1');
					assert.equal(res.body.issue_text, 'This is first test - Create an issue with every field');
					assert.equal(res.body.created_by, 'Arman');
					assert.equal(res.body.assigned_to, 'test team');
					assert.equal(res.body.status_text, 'testing');
					assert.isTrue(res.body.open);

					// deleting test1 data
					chai.request(server).delete("/api/issues/apitest").send({ _id: res.body._id });

					done();
				});
		});

		// #2
		test("Create an issue with only required fields: POST request to /api/issues/{project}", done => {
			chai.request(server)
				.post("/api/issues/apitest")
				.send({
					issue_title: "Test2",
					issue_text: "This is second test - Create issue with only required fileds",
					created_by: "Arman"
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.issue_title, 'Test2');
					assert.equal(res.body.issue_text, 'This is second test - Create issue with only required fileds');
					assert.equal(res.body.created_by, 'Arman');
					assert.equal(res.body.assigned_to, '');
					assert.equal(res.body.status_text, '');
					assert.isTrue(res.body.open);

					// dynamically setting test_id to this issue for further update and delete test
					test_id = res.body._id;

					done();
				});
		});

		// #3
		test("Create an issue with missing required fields: POST request to /api/issues/{project}", done => {
			chai.request(server)
				.post("/api/issues/apitest")
				.send({
					issue_title: "Test3",
					issue_text: "This is third test - Create issue with missing required fields",
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'required field(s) missing');

					done();
				});
		});

		// #4
		test("View issues on a project: GET request to /api/issues/{project}", done => {
			chai.request(server)
				.get("/api/issues/apitest")
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');

					done();
				});
		});

		// #5
		test("View issues on a project with one filters: GET request to /api/issues/{project}", done => {
			chai.request(server)
				.get("/api/issues/apitest?created_by=Arman")
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');

					done();
				});
		});

		// #6
		test("View issues on a project with multiple filters: GET request to /api/issues/{project}", done => {
			chai.request(server)
				.get("/api/issues/apitest?created_by=Arman&open=true")
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');

					done();
				});
		});

		// #7
		test("Update one field on an issue: PUT request to /api/issues/{project}", done => {
			chai.request(server)
				.put("/api/issues/apitest")
				.send({
					_id: test_id,
					issue_title: "Test7"
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.result, 'successfully updated');

					done();
				});
		});

		// #8
		test("Update multiple fileds on an issue: PUT request to /api/issue/{project}", done => {
			chai.request(server)
				.put("/api/issues/apitest")
				.send({
					_id: test_id,
					issue_title: "Test8",
					issue_title: "This is eighth test - Update multiple fields on an issue"
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.result, 'successfully updated');

					done();
				});
		});

		// #9
		test("Update an issue with missing _id: PUT request to /api/issues/{project}", done => {
			chai.request(server)
				.put("/api/issues/apitest")
				.send({
					issue_text: "This ninth test - Update an issue with missing _id"
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'missing _id');

					done();
				});
		});

		// #10
		test("Update an issue with no fields to update - PUT reqest to /api/issue/{project}", done => {
			chai.request(server)
				.put("/api/issues/apitest")
				.send({ _id: "607f94ae19f5231fc830c29d" })
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'no update field(s) sent');

					done();
				});
		});

		// #11
		test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", done => {
			chai.request(server)
				.put("/api/issues/apitest")
				.send({
					_id: "607f94ae19f5231fc830c29",
					issue_title: "Test10"
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'could not update');

					done();
				});
		});

		// #12
		test("Delete an issue: DELETE request to /api/issues/{project}", done => {
			chai.request(server)
				.delete("/api/issues/apitest")
				.send({
					_id: test_id,
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.result, 'successfully deleted');

					done();
				});
		});

		// #13
		test("Delete an issue with invalid _id: DELETE request to /api/issues/{project}", done => {
			chai.request(server)
				.delete("/api/issues/apitest")
				.send({
					_id: "607f94ae19f5231fc830c29",
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'could not delete');

					done();
				});
		});

		// #14
		test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", done => {
			chai.request(server)
				.delete("/api/issues/apitest")
				.send({})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'missing _id');

					done();
				});
		});
	});
});
