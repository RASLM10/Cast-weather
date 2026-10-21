import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    country: { type: String, default: '' },
    latitude: Number,
    longitude: Number,
  },
  { timestamps: true }
);

searchHistorySchema.index({ city: 1, country: 1 }, { unique: true });

export default mongoose.model('SearchHistory', searchHistorySchema);
