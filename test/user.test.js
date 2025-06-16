import { createRequire } from "module";
const require = createRequire(import.meta.url);
import db from "../utils/db.js";

const chai = require("chai");
const chaiHttp = require("chai-http");
import server from "../app.js";

const expect = chai.expect;
chai.use(chaiHttp);

describe("UC-201 Registreren als nieuwe user", () => {
  after(async () => {
    await db.execute("DELETE FROM `user` WHERE emailAdress = ?", [
      "jan@test.com",
    ]);
  });
  it("TC-201-1 Verplicht veld ontbreekt", (done) => {
    chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Jan",
        lastName: "Roelofs",
        password: "secret123",
        isActive: 1,
        phoneNumber: "0612345678",
        roles: "editor,guest",
        street: "Teststraat",
        city: "Teststad",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message");
        done();
      });
  });

  it("TC-201-2 Niet-valide emailadres ", (done) => {
    chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Jan",
        lastName: "Roelofs",
        emailAdress: "jan@updated",
        password: "secret123",
        isActive: 1,
        phoneNumber: "0612345678",
        roles: "editor,guest",
        street: "Teststraat",
        city: "Teststad",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message");
        done();
      });
  });

  it("TC-201-3 Niet-valide wachtwoord ", (done) => {
    chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Jan",
        lastName: "Roelofs",
        emailAdress: "jan@updated.com",
        password: "",
        isActive: 1,
        phoneNumber: "0612345678",
        roles: "editor,guest",
        street: "Teststraat",
        city: "Teststad",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message");
        done();
      });
  });

  it("TC-201-4 Gebruiker bestaat al ", (done) => {
    chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Jan",
        lastName: "Roelofs",
        emailAdress: "jan@updated.com",
        password: "secret123",
        isActive: 1,
        phoneNumber: "0612345678",
        roles: "editor,guest",
        street: "Nieuwe straat",
        city: "Nieuwe stad",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message");
        done();
      });
  });

  it("TC-201-5 Gebruiker succesvol geregistreerd", (done) => {
    chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Jan",
        lastName: "Roelofs",
        emailAdress: "jan@test.com",
        password: "secret123",
        isActive: 1,
        phoneNumber: "0612345678",
        roles: "editor,guest",
        street: "Nieuwe straat",
        city: "Nieuwe stad",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message");
        done();
      });
  });
});

describe("UC-202 Opvragen van overzicht van users", () => {
  let validToken;

  before((done) => {
    chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "jan@updated.com", password: "secret123" })
      .end((err, res) => {
        validToken = res.body.data.token;
        done();
      });
  });

  it("TC-202-1 Toon alle gebruikers (minimaal 2)", (done) => {
    chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${validToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an("array");
        expect(res.body.data.length).to.be.at.least(2);
        done();
      });
  });

  it("TC-202-2 Zoek op niet-bestaande velden", (done) => {
    chai
      .request(server)
      .get("/api/users?nonexistentField=value")
      .set("Authorization", `Bearer ${validToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an("array");
        done();
      });
  });

  it("TC-202-3 Filter op isActive=false", (done) => {
    chai
      .request(server)
      .get("/api/users?isActive=false")
      .set("Authorization", `Bearer ${validToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an("array");
        res.body.data.forEach((user) => {
          expect(user.isActive).to.equal(0);
        });
        done();
      });
  });

  it("TC-202-4 Filter op isActive=true", (done) => {
    chai
      .request(server)
      .get("/api/users?isActive=true")
      .set("Authorization", `Bearer ${validToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an("array");
        res.body.data.forEach((user) => {
          expect(user.isActive).to.greaterThanOrEqual(0);
        });
        done();
      });
  });

  it("TC-202-5 Zoek met maximaal 2 bestaande filters", (done) => {
    chai
      .request(server)
      .get("/api/users?isActive=true&city=Teststad")
      .set("Authorization", `Bearer ${validToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an("array");
        done();
      });
  });
});

describe("UC-203 Opvragen van gebruikersprofiel", () => {
  let validToken;

  before(async () => {
    await chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Theo",
        lastName: "Tester",
        emailAdress: "t.theo@example.com",
        password: "Secret123",
        street: "Straat 1",
        city: "Teststad",
      })
      .catch(() => {});

    const res = await chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "t.theo@example.com", password: "Secret123" });

    validToken = res.body.data.token;
  });

  it("TC-203-1 Ongeldig token", (done) => {
    chai
      .request(server)
      .get("/api/meals/my-meals")
      .set("Authorization", "Bearer invalid-token")
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.have.property("message");
        expect(res.body.data).to.deep.equal({});
        done();
      });
  });

  it("TC-203-2 Gebruiker is ingelogd met geldig token", (done) => {
    chai
      .request(server)
      .get("/api/meals/my-meals")
      .set("Authorization", `Bearer ${validToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data).to.be.an("array");
        done();
      });
  });
});

describe("UC-204 Opvragen van usergegevens bij ID", () => {
  let validToken;
  let testUserId;

  before(async () => {
    const registerRes = await chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Theo",
        lastName: "Tester",
        emailAdress: "t.theo@example.com",
        password: "Secret123",
        street: "Straat 1",
        city: "Teststad",
      })
      .catch(() => {});

    const loginRes = await chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "t.theo@example.com", password: "Secret123" });

    const userId = loginRes.body?.data?.id;

    if (userId) {
      await chai
        .request(server)
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${loginRes.body.data.token}`);
    }

    validToken = loginRes.body.data.token;
    testUserId = loginRes.body.data.id;
  });

  it("TC-204-1 Ongeldig token", (done) => {
    chai
      .request(server)
      .get(`/api/meals/user/${testUserId}`)
      .set("Authorization", "Bearer invalid.token.here")
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message");
        expect(res.body.data).to.deep.equal({});
        done();
      });
  });

  it("TC-204-2 Gebruiker-ID bestaat niet", (done) => {
    chai
      .request(server)
      .get("/api/meals/user/999999")
      .set("Authorization", `Bearer ${validToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message");
        expect(res.body.data).to.deep.equal({});
        done();
      });
  });

  it("TC-204-3 Gebruiker-ID bestaat", (done) => {
    chai
      .request(server)
      .get(`/api/meals/user/${testUserId}`)
      .set("Authorization", `Bearer ${validToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("data");
        expect(res.body.data).to.deep.equal({});
        done();
      });
  });
});

describe("UC-205 Updaten van usergegevens", () => {
  let validToken;
  let userId;
  const email = "u.update@test.com";
  const password = "Secret123";

  before(async () => {
    await chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Update",
        lastName: "Tester",
        emailAdress: email,
        password: password,
        phoneNumber: "06-12345678",
        street: "Straat",
        city: "Stad",
      })
      .catch(() => {});

    const loginRes = await chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: email, password: password });

    validToken = loginRes.body.data.token;
    userId = loginRes.body.data.id;
  });

  it("TC-205-1 Verplicht veld emailAddress ontbreekt", (done) => {
    chai
      .request(server)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        firstName: "Updated",
        phoneNumber: "06-12345678",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message");
        done();
      });
  });

  it("TC-205-2 Gebruiker is niet de eigenaar van de data", async () => {
    await chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Other",
        lastName: "User",
        emailAdress: "o.other@test.com",
        password: "Secret123",
        street: "Straat",
        city: "Stad",
      })
      .catch(() => {});

    const otherLogin = await chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "o.other@test.com", password: "Secret123" });

    const otherToken = otherLogin.body.data.token;

    const res = await chai
      .request(server)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        emailAdress: email,
        phoneNumber: "06-12345678",
      });

    expect(res).to.have.status(403);
  });

  it("TC-205-3 Niet-valide telefoonnummer", (done) => {
    chai
      .request(server)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        emailAdress: email,
        phoneNumber: "123456",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it("TC-205-4 Gebruiker bestaat niet", (done) => {
    chai
      .request(server)
      .put("/api/users/999999")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        emailAdress: "d.doesnotexist@test.com",
        phoneNumber: "06-12345678",
      })
      .end((err, res) => {
        expect(res).to.have.status(403);
        done();
      });
  });

  it("TC-205-5 Niet ingelogd", (done) => {
    chai
      .request(server)
      .put(`/api/users/${userId}`)
      .send({
        emailAdress: email,
        phoneNumber: "06-12345678",
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it("TC-205-6 Gebruiker succesvol gewijzigd", (done) => {
    chai
      .request(server)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        emailAdress: email,
        phoneNumber: "06-87654321",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.have.property("updatedData");
        expect(res.body.data.updatedData)
          .to.have.property("emailAdress")
          .that.equals("u.update@test.com");

        done();
      });
  });
});

describe("UC-206 Verwijderen van user", () => {
  let userId;
  let token;

  beforeEach(async () => {
    await chai.request(server)
      .post("/api/users/register")
      .send({
        firstName: "Delete",
        lastName: "Me",
        emailAdress: "d.delete@example.com",
        password: "Secret123",
        phoneNumber: "06-12345678",
        street: "Teststraat",
        city: "Teststad"
      });

    const loginRes = await chai.request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "d.delete@example.com", password: "Secret123" });

    token = loginRes.body.data.token;
    userId = loginRes.body.data.id;
  });

  it("TC-206-1 Gebruiker bestaat niet", async () => {
    const res = await chai.request(server)
      .delete("/api/users/999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res).to.have.status(403);
    expect(res.body).to.have.property("message");
  });

  it("TC-206-2 Gebruiker is niet ingelogd", async () => {
    const res = await chai.request(server)
      .delete(`/api/users/${userId}`);

    expect(res).to.have.status(401);
    expect(res.body).to.have.property("message");
  });

  it("TC-206-3 Gebruiker is niet de eigenaar van de data", async () => {
    await chai.request(server)
      .post("/api/users/register")
      .send({
        firstName: "Other",
        lastName: "User",
        emailAdress: "o.other@example.com",
        password: "Secret123",
        street: "Straat",
        city: "Stad"
      });

    const otherLogin = await chai.request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "o.other@example.com", password: "Secret123" });

    const otherToken = otherLogin.body.data.token;

    const res = await chai.request(server)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res).to.have.status(403);
    expect(res.body).to.have.property("message");
  });

  it("TC-206-4 Gebruiker succesvol verwijderd", async () => {
    const res = await chai.request(server)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("message");
    expect(res.body.message).to.include("deleted");
  });
});
