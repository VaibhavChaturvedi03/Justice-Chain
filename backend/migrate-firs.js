const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const FIR = require('./models/fir');

const migrateFIRs = async () => {
    try {
        console.log('Starting FIR migration...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Find all FIRs (including those without email field)
        const allFIRs = await FIR.find({});
        console.log(`Found ${allFIRs.length} total FIRs`);

        let updatedCount = 0;
        for (const fir of allFIRs) {
            if (!fir.email && fir.filedByUser && fir.filedByUser.email) {
                fir.email = fir.filedByUser.email;
                await fir.save();
                updatedCount++;
                console.log(`✓ Updated FIR ${fir.firNumber} with email: ${fir.email}`);
            } else if (fir.email) {
                console.log(`  FIR ${fir.firNumber} already has email: ${fir.email}`);
            } else {
                console.log(`! FIR ${fir.firNumber} has no email or filedByUser.email`);
            }
        }

        console.log(`\nMigration complete! Updated ${updatedCount} FIRs`);

        // Verify the migration
        const verifyFIRs = await FIR.find({ email: { $exists: true, $ne: '' } });
        console.log(`Verification: ${verifyFIRs.length} FIRs now have email field at root level`);

        await mongoose.connection.close();
        console.log('Migration finished and database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateFIRs();
