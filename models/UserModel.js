const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Social = require("../models/SocialModel");

const userSchema = new mongoose.Schema(
  {
    country_code: {
      type: String,
    },
    phone_number: {
      type: String,
      maxLength: 16,
      minLength:10,
      unique: true,
    },
    profileCover: {
      type: String,
      default : null
    },

    profileImage: {
      type: String,
      default : null
    },
    name: {
      type: String,
      trim: true,
      default : null
    },

    login_type: {
      type: String,
      required: [true, "Login type is required"],
    },

    provider_id: {
      type: String,
    },

    about_me: {
      type: String,
      maxLength: [100, "Max Lenght is 100 charcters"],
      default : null
    },

    email: {
      type: String,
      lowercase: true,
      default : null
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    active: {
      type: Boolean,
      default: true,
    },

    socials: {
      type: [
        {
          social: {
            type: mongoose.Schema.ObjectId,
            ref: "Social",
            required: true
          },
          userUrl: {
            type: String,
            required: true
          },
        },
        
      ],
      validate: [arrayLimit, "exceeds the limit of 8"],
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  console.log(val);
  return val.length <= 8 || false; // Return false if validation fails
}

// function limitArray(limit){
//   return function(value){
//       return value.length <= limit;
//   }
// }

// userSchema.pre("s", function (next) {
//   console.log("ttt1");
//   if (this.use.isModified("socials")) {
//     console.log("ttt2");
//     if (this.socials.length > 2) {
//       const error = new Error(
//         `The 'socials' array cannot have more than ${2} items.`
//       );
//       return next(error);
//     }
//   }
//   next();
// });

// userSchema.pre("save", async function (next) {
//   //Hashing User Password
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// userSchema.path("socials").validate(function (value) {
//   console.log(value);
//   return value.length <= 2;
// }, "Validation Error");


userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "socials.social", // Specify the path to the 'socialId' reference
    model: "Social", // The referenced model
    select: "image name url __v", // Select the fields you want to populate
  });
  
  next();
});

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    // Exclude the '_id' and '__v' fields from the result
    delete ret.__v;
    delete ret.login_type;
    delete ret.active;
    delete ret.role;
  },
});



userSchema.post("init", (doc) => {
  if (doc.profileImage) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;

    doc.profileImage = imageUrl;
  }

  if (doc.profileCover) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileCover}`;

    doc.profileCover = imageUrl;
  }
});

module.exports = mongoose.model("User", userSchema);
