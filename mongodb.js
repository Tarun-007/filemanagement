const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileId: String,
    fileName: String,
    createdAt: Date,
    size: Number,
    fileType: String
});

const File = mongoose.model('files', fileSchema);

async function uploadFileMetadata(fileData) {
    try {
        console.log("metadata uploading")
        return await File.create(fileData);
       
    } catch (error) {
        throw new Error('Error uploading file');
}
}

async function getFileMetadataById(fileId) {
    try {
        return await File.findOne({ fileId });
    } catch (error) {
        throw new Error('Error retrieving file');
    }
}

async function deleteFileMetadataById(fileId) {
    try {
        return await File.deleteOne({ fileId });
    } catch (error) {
        // Throw error if deletion fails
        throw new Error('Error deleting file metadata');
    }
}

// Function to update file metadata by fileId in MongoDB
async function updateFileMetadataById(fileId, newMetadata) {
    try {
        return await File.updateOne({ fileId }, newMetadata);
    } catch (error) {
        // Throw error if update fails
        throw new Error('Error updating file metadata');
    }
}

async function getAllFiles() {
    try {
        return await File.find({}, { _id: 0, __v: 0 });
    } catch (error) {
        throw new Error('Error fetching files from the database');
    }
}




module.exports = {
    updateFileMetadataById,
    deleteFileMetadataById,
    uploadFileMetadata,
    getFileMetadataById,
    getAllFiles
};
