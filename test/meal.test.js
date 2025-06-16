import { createRequire } from "module";
const require = createRequire(import.meta.url);
import db from "../utils/db.js";

const chai = require("chai");
const chaiHttp = require("chai-http");
import server from "../app.js";

const expect = chai.expect;
chai.use(chaiHttp);

describe("UC-301 Toevoegen van maaltijd", () => {
  let token;
  let cookId;

  before(async () => {
    await chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Chef",
        lastName: "Test",
        emailAdress: "c.chef@example.com",
        password: "Secret123",
        street: "Keukenstraat",
        city: "Etenstad",
      })
      .catch(() => {});

    const res = await chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "c.chef@example.com", password: "Secret123" });

    token = res.body.data.token;
    cookId = res.body.data.id;
  });

  it("TC-301-1 Verplicht veld ontbreekt", async () => {
    const res = await chai
      .request(server)
      .post("/api/meals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        price: 12.5,
        dateTime: new Date().toISOString(),
        maxAmountOfParticipants: 5,
        imageUrl: "https://example.com/image.jpg",
        description: "Lekkere maaltijd",
      });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message");
  });

  it("TC-301-2 Niet ingelogd", async () => {
    const res = await chai.request(server).post("/api/meals").send({
      name: "Pasta",
      price: 12.5,
      dateTime: new Date().toISOString(),
      maxAmountOfParticipants: 5,
      imageUrl: "https://example.com/image.jpg",
      description: "Pasta met saus",
    });

    expect(res).to.have.status(401);
    expect(res.body).to.have.property("message");
  });

  it("TC-301-3 Maaltijd succesvol toegevoegd", async () => {
    const res = await chai
      .request(server)
      .post("/api/meals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Pizza Margherita",
        price: 9.99,
        dateTime: new Date().toISOString(),
        maxAmountOfParticipants: 4,
        imageUrl: "https://example.com/pizza.jpg",
        description: "Echte Italiaanse pizza",
        isVega: true,
        isVegan: false,
        isToTakeHome: true,
        allergenes: ["gluten"],
      });

    expect(res).to.have.status(201);
    expect(res.body.data).to.include({
      name: "Pizza Margherita",
      price: "9.99",
    });
  });
});

describe("UC-302 Wijzigen van maaltijdgegevens", () => {
  let token, otherToken, mealId;

  before(async () => {
    await chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Cook",
        lastName: "User",
        emailAdress: "c.cook@example.com",
        password: "Secret123",
        street: "Straat",
        city: "Stad",
      })
      .catch(() => {});

    const loginRes = await chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "c.cook@example.com", password: "Secret123" });

    token = loginRes.body.data.token;

    await chai
      .request(server)
      .post("/api/users/register")
      .send({
        firstName: "Other",
        lastName: "User",
        emailAdress: "o.other@example.com",
        password: "Secret123",
        street: "Straat",
        city: "Stad",
      })
      .catch(() => {});

    const otherLogin = await chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "o.other@example.com", password: "Secret123" });

    otherToken = otherLogin.body.data.token;

    const mealRes = await chai
      .request(server)
      .post("/api/meals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Original Meal",
        description: "Original description",
        price: 12.5,
        dateTime: new Date().toISOString(),
        imageUrl: "https://example.com/image.jpg",
        maxAmountOfParticipants: 4,
        isVega: false,
        isVegan: false,
        isToTakeHome: true,
        allergenes: ["gluten"],
      });

    mealId = mealRes.body.data.id;
  });

  it("TC-302-1 Verplicht veld ontbreekt", async () => {
    const res = await chai
      .request(server)
      .put(`/api/meals/${mealId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Meal",
        maxAmountOfParticipants: 3,
      });

    expect(res).to.have.status(400);
  });

  it("TC-302-2 Niet ingelogd", async () => {
    const res = await chai.request(server).put(`/api/meals/${mealId}`).send({
      name: "Updated Meal",
      price: 10,
      maxAmountOfParticipants: 3,
    });

    expect(res).to.have.status(401);
  });

  it("TC-302-3 Niet de eigenaar van de data", async () => {
    const res = await chai
      .request(server)
      .put(`/api/meals/${mealId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        name: "Updated Meal",
        price: 10,
        maxAmountOfParticipants: 3,
      });

    expect(res).to.have.status(403);
  });

  it("TC-302-4 Maaltijd bestaat niet", async () => {
    const res = await chai
      .request(server)
      .put(`/api/meals/999999`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Non-existent Meal",
        price: 10,
        maxAmountOfParticipants: 3,
      });

    expect(res).to.have.status(404);
  });

  it("TC-302-5 Maaltijd succesvol gewijzigd", async () => {
    const res = await chai
      .request(server)
      .put(`/api/meals/${mealId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Meal",
        price: 15,
        maxAmountOfParticipants: 2,
      });

    expect(res).to.have.status(200);
    expect(res.body.data.updatedMeal).to.include({
      name: "Updated Meal",
      price: '15.00',
      maxAmountOfParticipants: 2,
    });
  });
});

describe('UC-303 Opvragen van alle maaltijden', () => {
  let token;

  before(async () => {
    const res = await chai
      .request(server)
      .post('/api/auth/login')
      .send({ emailAdress: 'c.cook@example.com', password: 'Secret123' });

    token = res.body.data.token;
  });

  it('TC-303-1 Lijst van maaltijden geretourneerd', async () => {
    const res = await chai
      .request(server)
      .get('/api/meals')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('data');
    expect(res.body.data).to.be.an('array');

    if (res.body.data.length > 0) {
      expect(res.body.data[0]).to.include.keys('id', 'name', 'price');
    }
  });
});

describe('UC-304 Opvragen van maaltijd bij ID', () => {
  let token;
  let createdMealId;

  before(async () => {
    const res = await chai
      .request(server)
      .post('/api/auth/login')
      .send({ emailAdress: 'c.cook@example.com', password: 'Secret123' });

    token = res.body.data.token;

    const createRes = await chai
      .request(server)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Maaltijd voor ophalen',
        description: 'Beschrijving',
        price: 12.5,
        dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
        imageUrl: 'http://example.com/image.jpg',
        maxAmountOfParticipants: 3,
        allergenes: 'noten',
        isActive: true,
        isVega: false,
        isVegan: false,
        isToTakeHome: true
      });

    createdMealId = createRes.body.data.id;
  });

  it('TC-304-1 Maaltijd bestaat niet', async () => {
    const res = await chai
      .request(server)
      .get('/api/meals/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(404);
    expect(res.body.message).to.match(/not found/i);
  });

  it('TC-304-2 Details van maaltijd geretourneerd', async () => {
    const res = await chai
      .request(server)
      .get(`/api/meals/${createdMealId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body.data).to.include.keys('id', 'name', 'price');
    expect(res.body.data.name).to.equal('Maaltijd voor ophalen');
  });
});

describe('UC-305 Verwijderen van maaltijd', () => {
  let cookToken, otherToken, mealId;

  before(async () => {
    const cookRes = await chai
      .request(server)
      .post('/api/auth/login')
      .send({ emailAdress: 'c.cook@example.com', password: 'Secret123' });
    cookToken = cookRes.body.data.token;

    const otherRes = await chai
      .request(server)
      .post('/api/auth/login')
      .send({ emailAdress: 'o.other@example.com', password: 'secret123' });
    otherToken = otherRes.body.data.token;

    const mealRes = await chai
      .request(server)
      .post('/api/meals')
      .set('Authorization', `Bearer ${cookToken}`)
      .send({
        name: 'Te verwijderen maaltijd',
        description: 'Tijdelijke testmaaltijd',
        price: 10,
        dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
        imageUrl: 'http://example.com/delete.jpg',
        maxAmountOfParticipants: 4,
        allergenes: 'gluten',
        isActive: true,
        isVega: false,
        isVegan: false,
        isToTakeHome: true
      });

    mealId = mealRes.body.data.id;
  });

  it('TC-305-1 Niet ingelogd', async () => {
    const res = await chai.request(server).delete(`/api/meals/${mealId}`);
    expect(res).to.have.status(401);
  });

  it('TC-305-2 Niet de eigenaar van de data', async () => {
    const res = await chai
      .request(server)
      .delete(`/api/meals/${mealId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res).to.have.status(403);
  });

  it('TC-305-3 Maaltijd bestaat niet', async () => {
    const res = await chai
      .request(server)
      .delete(`/api/meals/999999`)
      .set('Authorization', `Bearer ${cookToken}`);
    expect(res).to.have.status(404);
  });

  it('TC-305-4 Maaltijd succesvol verwijderd', async () => {
    const res = await chai
      .request(server)
      .delete(`/api/meals/${mealId}`)
      .set('Authorization', `Bearer ${cookToken}`);
    expect(res).to.have.status(200);
    expect(res.body.message).to.match(/deleted/i);
  });
});



