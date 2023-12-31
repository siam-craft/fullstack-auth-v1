import multer from "multer";

const fileName = (req, file, next) => {
  let lastIndexOf = file.originalname.lastIndexOf(".");
  let ext = file.originalname.substring(lastIndexOf);
  next(null, `img-${Date.now()}${ext}`);
};

const destination = (req, file, next) => {
  next(null, `${__dirname}/../uploads`);
};

const upload = multer({
  storage: multer.diskStorage({ destination, fileName }),
});

export default upload;
