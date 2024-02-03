const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadFileMetadata, getFileMetadataById, deleteFileMetadataById, updateFileMetadataById, getAllFiles } = require('./mongodb');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
    const { file } = req;
    const fileId = uuidv4();
    const metadata = {
        fileId,
        fileName: file.originalname,
        createdAt: new Date(),
        size: file.size,
        fileType: path.extname(file.originalname)
    };
    const filePath = path.join(__dirname, './uploads', fileId + path.extname(file.originalname));
    try {
        await uploadFileMetadata(metadata);

        await fs.writeFile(filePath, file.buffer, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File successfully written to disk:', filePath);
            }
        });
        res.json({ filepath: filePath, fileId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:fileId', async (req, res) => {
    const { fileId } = req.params;

    try {
        const file = await getFileMetadataById(fileId);

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = path.join(__dirname, './uploads', fileId + file.fileType);
        console.log(filePath)
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:fileId', upload.single('file'), async (req, res) => {
    const { fileId } = req.params;
    const { file } = req;
    console.log(file)
    const metadata = {
        fileId,
        fileName: file.originalname,
        createdAt: new Date(),
        size: file.size,
        fileType: path.extname(file.originalname)
    };

    const filePath = path.join(__dirname, './uploads', fileId + path.extname(file.originalname));
    try {
        await updateFileMetadataById(fileId, metadata);

        await fs.writeFile(filePath, file.buffer, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File successfully written to disk:', filePath);
            }
        });
        res.json({ filepath: filePath, fileId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:fileId', async (req, res) => {
    const { fileId } = req.params;

    try {
        const file = await getFileMetadataById(fileId);
        await deleteFileMetadataById(fileId);

        const filePath = path.join(__dirname, './uploads', fileId + file.fileType);
        fs.unlinkSync(filePath);

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const files = await getAllFiles();

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'No files found' });
        }

        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.put('/:fileId', async (req, res) => {
    const { fileId } = req.params;
    const newMetadata = req.body;

    try {
   

        if (newMetadata.fileName || newMetadata.fileType) {
            const oldMetadata = await getFileMetadataById(fileId);
            const oldFilePath = path.join(__dirname, '../uploads', fileId + oldMetadata.fileType);
            const newFilePath = path.join(__dirname, '../uploads', fileId + (newMetadata.fileType || oldMetadata.fileType));
            fs.renameSync(oldFilePath, newFilePath);
        }

        await updateFileMetadataById(fileId, newMetadata);

        res.json({ message: 'File metadata updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router