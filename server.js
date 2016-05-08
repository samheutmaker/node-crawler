const express = require('express');
const app = express();
const jsonParser = require('body-parser').json();

const PORT = process.env.PORT || 3000;


const searchRouter = express.Router();




searchRouter.post('/search', jsonParser, (req, res) => {
	console.log(req.body);
});


app.use('/', searchRouter);

app.listen(PORT, () => {
	console.log('Server live on PORT ' + PORT);
});
