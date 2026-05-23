const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardData = async (req, res) => {
    try {
        const member = await prisma.member.findUnique({
            where: { id: req.user.id },
            select: {
                name: true,
                expiryDate: true,
                photo: true
            }
        });

        const today = new Date();
        const expiry = new Date(member.expiryDate);
        const diffTime = expiry - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let alert = null;
        if (daysLeft === 1) alert = "Expires tomorrow";
        else if (daysLeft <= 3 && daysLeft > 0) alert = `Expires in ${daysLeft} days`;

        res.json({ ...member, daysLeft, alert });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard" });
    }
};

exports.updatePhoto = async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const filePath = `/uploads/${req.file.filename}`;
    try {
        await prisma.member.update({
            where: { id: req.user.id },
            data: { photo: filePath }
        });
        res.json({ photo: filePath });
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};