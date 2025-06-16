import { createRequire } from "module";
const require = createRequire(import.meta.url);
import bcrypt from "bcryptjs";
import db from "../utils/db.js";

const chai = require("chai");
const chaiHttp = require("chai-http");
import server from "../app.js";

const expect = chai.expect;
chai.use(chaiHttp);

describe("UC-101 Inloggen", () => {
  const testEmail = "l.loginuser@example.com";
  const testPassword = "secret123";

  before(async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    // Clean up if user already exists
    await db.execute("DELETE FROM `user` WHERE emailAdress = ?", [testEmail]);
    await db.execute(
      `INSERT INTO \`user\` 
        (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber, roles) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Test",
        "User",
        "Teststraat",
        "Teststad",
        1,
        testEmail,
        hashedPassword,
        "0612345678",
        "editor,guest",
      ]
    );
  });

  it("TC-101-1 Verplicht veld ontbreekt", (done) => {
    chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: testEmail })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message");
        done();
      });
  });

  it("TC-101-2 Niet-valide wachtwoord", (done) => {
    chai
      .request(server)
      .post("/api/auth/login")
      .send({
        emailAdress: testEmail,
        password: "wrongpassword",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message");
        done();
      });
  });

  it("TC-101-3 Gebruiker bestaat niet", (done) => {
    chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "nonexistent@example.com", password: "Password123" })
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message");
        done();
      });
  });

  it("TC-101-4 Gebruiker succesvol ingelogd", (done) => {
    chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: testEmail, password: testPassword })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data).to.have.property("token");
        done();
      });
  });
});
