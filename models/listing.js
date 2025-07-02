const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

// Define schema for the Listing model
const listingSchema = new Schema({
  title: {
    type: String,
    required: true, // Title is a required field
  },
  description: String,
  image: {
    type: String,
    default: "https://unsplash.com/photos/a-purple-and-black-photo-of-a-mountain-range-A6e7COw_nos", // Default image URL
    set: (v) => (v === " " ? "https://unsplash.com/photos/a-purple-and-black-photo-of-a-mountain-range-A6e7COw_nos" : v), // Set the default if an empty string is provided
  },
  price: Number,
  location: {
    type: String,
    required: true, // Make location a required field
  },
  country: {
    type: String,
    required: true, // Make country a required field
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review", // Reference to the Review model
    },
  ],


});

listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});




// Create the Listing model using the schema
const Listing = mongoose.model("Listing", listingSchema);

// Export the model to be used in other files
module.exports = Listing;
