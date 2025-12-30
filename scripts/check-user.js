const mongoose = require('mongoose');

async function checkUser() {
    console.log('Checking for user in database...');

    // Manual load since we aren't using dotenv
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ MONGODB_URI is missing');
        return;
    }

    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // Basic schema definition for query
        const UserSchema = new mongoose.Schema({
            email: String,
            name: String,
            identificationStatus: String
        }, { collection: 'users' });

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const email = 'pacolliruhan844@gmail.com';
        console.log(`Searching for user: ${email}`);

        const user = await User.findOne({ email: email });

        if (user) {
            console.log('✅ User FOUND:', user._id, user.email);
            console.log('Identification Status:', user.identificationStatus);
        } else {
            console.log(`❌ User "${email}" NOT FOUND in database.`);
        }

    } catch (error) {
        console.error('Database Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
