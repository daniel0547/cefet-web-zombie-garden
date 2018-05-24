const express = require('express');
const db = require('../db');
const router = express.Router();

/* GET lista de pessoas. */
router.get('/', (req, res, next) => {

  db.query({
    sql: 'SELECT * FROM person LEFT OUTER JOIN zombie ON eatenBy = zombie.id',
    // nestTables resolve conflitos de haver campos com mesmo nome nas tabelas
    // nas quais fizemos JOIN (neste caso, `person` e `zombie`).
    // descrição: https://github.com/felixge/node-mysql#joins-with-overlapping-column-names
    nestTables: true
  }, (err, rows) => {
      if (err) {
        res.status(500)
          .send('Problema ao recuperar pessoas. Descrição: ' + err);
      }

      // renderiza a view de listagem de pessoas, passando como contexto
      // de dados:
      // - people: com um array de `person`s do banco de dados
      // - success: com uma mensagem de sucesso, caso ela exista
      //   - por exemplo, assim que uma pessoa é excluída, uma mensagem de
      //     sucesso pode ser mostrada
      // - error: idem para mensagem de erro
      res.render('listPeople', {
        people: rows,
        success: req.flash('success'),
        error: req.flash('error')
      });
  });
});


/* PUT altera pessoa para morta por um certo zumbi */
router.put('/eaten/', (req, res) => {
  db.query('UPDATE person ' +
           'SET alive = false, eatenBy = ' + db.escape(req.body.zombie) + ' ' +
           'WHERE id = ' + db.escape(req.body.person),
    (err, result) => {
      if (err) {
        req.flash('error', 'Erro desconhecido. Descrição: ' + err);
      } else if (result.affectedRows !== 1) {
        req.flash('error', 'Nao ha pessoa para ser comida');
      } else {
        req.flash('success', 'A pessoa foi inteiramente (nao apenas cerebro) engolida.');
      }
      res.redirect('/');
  });
});


/* GET formulario de registro de nova pessoa */
router.get('/new/', (req, res) => {
  res.render('newPerson');
});

router.post('/', (req, res) => {
  db.query('INSERT INTO person VALUES(NULL,'+ db.escape(req.body.name) +',1,NULL);',
    (err, result) => {
      if (err) {
        req.flash('error', 'Erro desconhecido. Descrição: ' + err);
      } else {
        req.flash('success', 'A pessoa foi cadastrada com sucesso.');
      }
      res.redirect('/people');
  });
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM person where id='+db.escape(req.params.id)+';',
    (err, result) => {
      if (err) {
        req.flash('error', 'Erro desconhecido. Descrição: ' + err);
      } else if (result.affectedRows !== 1) {
        req.flash('error', 'Nao ha pessoa para ser removida');
      } else {
        req.flash('success', 'A pessoa foi removida com sucesso.');
      }
      res.redirect('/people');
  });
});



/* POST registra uma nova pessoa */
// Exercício 1: IMPLEMENTAR AQUI
// Dentro da callback de tratamento da rota:
//   1. Fazer a query de INSERT no banco
//   2. Redirecionar para a rota de listagem de pessoas
//      - Em caso de sucesso do INSERT, colocar uma mensagem feliz
//      - Em caso de erro do INSERT, colocar mensagem vermelhinha


/* DELETE uma pessoa */
// Exercício 2: IMPLEMENTAR AQUI
// Dentro da callback de tratamento da rota:
//   1. Fazer a query de DELETE no banco
//   2. Redirecionar para a rota de listagem de pessoas
//      - Em caso de sucesso do INSERT, colocar uma mensagem feliz
//      - Em caso de erro do INSERT, colocar mensagem vermelhinha



module.exports = router;
