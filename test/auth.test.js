import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const chai = require('chai');
const chaiHttp = require('chai-http');
import server from '../app.js';

const expect = chai.expect;
chai.use(chaiHttp);

describe('UC-101 Inloggen', () => {
  it('TC-101-1 Verplicht veld ontbreekt', (done) => {
    chai
      .request(server)
      .post('/api/auth/login')
      .send({ emailAdress: 'test@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message');
        done();
      });
  });

  it('TC-101-2 Niet-valide wachtwoord', (done) => {
    chai
      .request(server)
      .post('/api/auth/login')
      .send({ emailAdress: 'jan@updated.com', password: 'wrongpassword' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message');
        done();
      });
  });

  it('TC-101-3 Gebruiker bestaat niet', (done) => {
    chai
      .request(server)
      .post('/api/auth/login')
      .send({ emailAdress: 'nonexistent@example.com', password: 'Password123' })
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('message');
        done();
      });
  });

  it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
    chai
      .request(server)
      .post('/api/auth/login')
      .send({ emailAdress: 'jan@updated.com', password: 'secret123' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data).to.have.property('token');
        done();
      });
  });
});

