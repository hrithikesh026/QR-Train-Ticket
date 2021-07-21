// const cred = require('../utils/cred')
const  mongoose = require('mongoose')
const cred = require('../utils/cred')
const uri = 'mongodb+srv://'+cred.db_username+':'+cred.db_password+'@qrtraindb.valeg.mongodb.net/QrTrainDB?retryWrites=true&w=majority'
// const uri = 'mongodb+srv://'+cred.db_username+':'+ cred.db_password+'@cluster0.k7izx.mongodb.net/QrTrainDB?retryWrites=true&w=majority'
// const uri = 'mongodb://127.0.0.1:27017/QRTicket'
mongoose.connect(uri,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

console.log('database running')

const users = mongoose.model('users',{
    email: {type: String},
    first_name: {type: String},
    last_name: {type: String},
    password: {type: String},
    dob: {type: Date},
    wallet_balance: {type: Number}
})
const tickets = mongoose.model('tickets',{
    email : {type: String},
    source : {type: String},
    destination: {type: String},
    date: {type: Date},
    train_no: {type: Number},
    train_name: {type: String}
})
const fetch_user = (username,callback)=>{
    users.findOne({email:username},(err,doc)=>{
        if(err){
            callback(err,undefined);
            console.log('Unable to fetch user')
        }else{
            // console.log(doc)
            callback(undefined,doc)
        }
    })
}

const add_user = (body,callback)=>{
    const new_user = new users({
        email: body.email,
        first_name:body.firstname,
        last_name: body.lastname,
        password: body.password,
        dob: new Date(body.dob),
        wallet_balance: 0
    });
    new_user.save().then(()=>{
        callback(undefined,true)
    }).catch((err)=>{
        callback(err,false)
    })
}

const add_tickets = (body,callback)=>{
    users.findOne({email: data.email},'wallet_balance').then((doc)=>{
        if(doc.wallet_balance<body.price){
            callback('Not Enought Balance',undefined)
        }
        else{
            new_balance = doc.wallet_balance - body.price
            var wallet_update = 0;
            users.findOneAndUpdate({email: body.email},{wallet_balance: new_balance},{useFindAndModify:true},(err,doc)=>{
                if(err){
                    callback('Enable to add ticket')
                }
                else{
                    const ticket = new tickets({
                        email : body.email,
                        from : body.source,
                        to: body.destination,
                        date: new Date(body.date),
                        train_no: body.train_no,
                        train_name: body.train_name,
                        class: body.class,
                        ticket_price: body.price
                    })
                    ticket.save().then(()=>{
                    callback(undefined,true)
                    }).catch((err)=>{
                    callback('Error During Transaction '+err,false)
                    })
                }
            })
            
            
        }
    }).catch((err)=>{
        callback(err)
    })
    
}

const fetch_tickets = (Email,callback)=>{
    tickets.find({email: Email},(err,doc)=>{
        if(err){
            callback(err)
        }
        else{
            
            callback(undefined, doc)
        }
    })
}

const recharge = async (data,callback)=>{
    users.findOne({email: data.email},'wallet_balance').then((doc)=>{
        var balance = doc.wallet_balance
        balance = balance + data.amount
        users.findOneAndUpdate({email: data.email},{wallet_balance: balance},{useFindAndModify:true},(err,doc)=>{
        if(err){
            callback('Error while updating wallet balance: '+err)
        }
        else{
            callback(undefined, doc)
        }
    })
    }).catch((err)=>{
        callback(err)
    })
    
}

module.exports={users,tickets,fetch_tickets,fetch_user,add_tickets,add_user,recharge}