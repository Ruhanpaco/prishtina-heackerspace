const mongoose = require('mongoose');

async function resetAndCheck() {
    console.log('--- Resetting Attempts and Checking User ---');
    const uri = process.env.MONGODB_URI;
    if (!uri) return console.error('MONGODB_URI missing');

    try {
        await mongoose.connect(uri);
        const email = 'pacolliruhan844@gmail.com';

        const UserSchema = new mongoose.Schema({
            email: String,
            passwordResetAttempts: Number,
            passwordResetTokenExpires: Date,
            identificationStatus: String
        }, { collection: 'users' });

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        console.log(`Searching for: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found.');
            return;
        }

        console.log(`Found User: ${user.email}`);
        console.log(`Current Attempts: ${user.passwordResetAttempts || 0}`);
        console.log(`Reset Token Expires: ${user.passwordResetTokenExpires || 'N/A'}`);

        console.log('Resetting attempts to 0...');
        user.passwordResetAttempts = 0;
        user.passwordResetTokenExpires = null;
        await user.save();

        console.log('✅ Attempts reset successfully. You can now try the website again!');

    } catch (e) { console.error(e); }
    finally { mongoose.disconnect(); }
}

resetAndCheck();
