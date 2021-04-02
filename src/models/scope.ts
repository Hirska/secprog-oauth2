import mongoose from 'mongoose';
import { DocumentScope } from '../types';
mongoose.set('useFindAndModify', false);

const scopeSchema = new mongoose.Schema({
  scope: { type: String, unique: true, required: true }
});

export default mongoose.model<DocumentScope>('Scope', scopeSchema);
