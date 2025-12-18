const admin = require("../utils/firebase");
const axios = require("axios");

exports.signup = async (req, res) => {
    const { name, email, password, emergencyCon1, emergencyCon2 } = req.body;

    try {
        // 1. Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            displayName: name,
            email,
            password
        });

        // 2. Store user data in Realtime Database
        await admin.database().ref(`users/${userRecord.uid}`).set({
            name,
            email,
            password,
            emergencyCon1,
            emergencyCon2,
            createdAt: new Date().toISOString(),
        });

        res.status(201).json({
            message: "User created successfully",
            uid: userRecord.uid,
        });
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: "Email already registered" });
        }
        res.status(400).json({ error: error.message });
    }
};



exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const apiKey =
            "AIzaSyDIjATYYpgV7_se32HqabxuL9gWxryudlc";

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
                email,
                password,
                returnSecureToken: true
            }
        );
        const uid = response.data.localId;

        // 2. Fetch additional user data from Realtime DB
        const snapshot = await admin.database().ref(`users/${uid}`).once("value");
        const userData = snapshot.val();

        res.status(200).json({
            message: "Signin successful",
            uid,
            idToken: response.data.idToken,
            email: response.data.email,
            name: userData?.name || null,
            emergencyCon1: userData?.emergencyCon1 || null,
            emergencyCon2: userData?.emergencyCon2 || null
        });

    } catch (error) {
        const msg = error.response?.data?.error?.message || "Signin failed";
        res.status(400).json({ error: msg });
    }
};


exports.getUserById = async(req,res) => {
    const { uid } = req.params;

    try{
        const snapshot = await admin.database().ref(`users/${uid}`).once('value');
        const userData = snapshot.val();

        if(!userData){
            return res.status(404).json({error: "User not found"})
        }

        const { password, ...newUserData } = userData;
        res.status(200).json({
            message : "User Fetched Successfully",
            uid,
            user: newUserData,
        })

    }catch(error){
        res.status(500).json({
            error: "Failed to fetch user"
            
        });
        console.log(error);
    }
};

