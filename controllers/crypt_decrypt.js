const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const algorithm = 'aes-192-cbc';


const encrypt = (password, text) => {
    try{
        const salt = bcrypt.genSaltSync(10);
        const passwordHashedAgain = bcrypt.hashSync(password, salt);
        const key = crypto.scryptSync(passwordHashedAgain, 'salt', 24);
        const iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text,'utf8','hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + salt.toString('hex');
    } catch(err){
        return false;
    }
    
}

const decrypt = (password, text) => {
    try{
        const textParts = text.split(':');
        const salt = textParts[2];
        const passwordHashedAgain = bcrypt.hashSync(password, salt);
        const key = crypto.scryptSync(passwordHashedAgain, 'salt', 24);
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encrypted = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted.toString();
    } catch(err) {
        return false;
    }
   
}

const decryptAndEncryptAll = (oldPassword, newPassword, journals) => {
    try{
        const decryptedJournals =  journals.map(journal => decrypt(oldPassword,journal.journal));
        const reEnctyptedJournals = decryptedJournals.map(journal => encrypt(newPassword,journal));
        if(!decryptedJournals || !reEnctyptedJournals){
            return false;
        }
        return reEnctyptedJournals;
    } catch(err) {
        return false;
    }
}


module.exports = {
    encrypt,
    decrypt,
    decryptAndEncryptAll
}
