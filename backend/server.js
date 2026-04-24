const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.post('/api/orders/process', (req, res) => {
    const { cart, amount } = req.body;

    console.log("-----------------------------------");
    console.log(`ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ! Συνολικό Ποσό: ${amount.toFixed(2)} €`);
    console.log("Βιβλία που αγοράστηκαν:");
    cart.forEach(book => console.log(`- ${book.title} (Τεμάχια: ${book.quantity})`));
    console.log("-----------------------------------");

    if (amount > 0) {      
        res.status(200).json({ 
            message: "Η παραγγελία ολοκληρώθηκε με επιτυχία!", 
            status: "success" 
        });
    } else {
        res.status(400).json({ 
            message: "Αποτυχία πληρωμής. Μη έγκυρο ποσό.", 
            status: "error" 
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Ο Server ξεκίνησε επιτυχώς στη θύρα ${PORT}`);
});