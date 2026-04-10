import mongoose from 'mongoose';

const testMongo = async () => {
    const uris = [
        "mongodb+srv://admin:zKflt4c0kRNvW40r@cluster0.ka7unfp.mongodb.net/ai-therapist?appName=Cluster0",
        "mongodb+srv://admin:<zKflt4c0kRNvW40r>@cluster0.ka7unfp.mongodb.net/ai-therapist?appName=Cluster0"
    ];

    for (const uri of uris) {
        console.log(`\nTesting: ${uri.replace(/:([^:@]+)@/, ':***@')}`); // hide password in logs
        try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
            console.log("✅ SUCCESS! Connected to this URI.");
            mongoose.disconnect();
            return uri; // Return successful URI
        } catch (err) {
            console.log("❌ FAILED:", err.message);
        }
    }
};

testMongo();
