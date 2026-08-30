const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a PDF file.' });
        }

        const cloudinaryStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',       
                folder: 'team_zero',     
                public_id: req.file.originalname.split('.')[0]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return res.status(500).json({ error: 'Cloudinary upload failed' });
                }

                res.status(200).json({
                    message: 'PDF uploaded to Cloudinary successfully!',
                    cloudinary_url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );

        const stream = Readable.from(req.file.buffer);
        stream.pipe(cloudinaryStream);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
};

module.exports = { uploadMedia };   
    