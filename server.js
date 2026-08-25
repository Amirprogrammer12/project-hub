const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();

// Render خودش PORT را تعیین می‌کند.
// روی کامپیوتر خودمان اگر PORT وجود نداشته باشد، از 3000 استفاده می‌کنیم.
const PORT = process.env.PORT || 3000;

// ===============================
// ADMIN SETTINGS
// ===============================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345678";

// ===============================
// DATABASE
// ===============================

const db = new Database(
    path.join(__dirname, "projects.db")
);

db.prepare(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        budget INTEGER NOT NULL,
        deadline TEXT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        created_at TEXT NOT NULL
    )
`).run();

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ===============================
// ADMIN LOGIN
// ===============================

app.post("/api/admin/login", (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        return res.json({
            success: true
        });

    }

    res.status(401).json({
        success: false,
        message: "نام کاربری یا رمز عبور اشتباه است."
    });

});

// ===============================
// WEBSITE FILES
// ===============================

app.use(
    express.static(__dirname)
);

// ===============================
// REGISTER PROJECT
// ===============================

app.post("/api/projects", (req, res) => {

    try {

        const {
            title,
            category,
            description,
            budget,
            deadline,
            name,
            phone,
            email
        } = req.body;

        if (
            !title ||
            !category ||
            !description ||
            !budget ||
            !name ||
            !phone
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "لطفاً تمام فیلدهای الزامی را تکمیل کنید."

            });

        }

        const createdAt =
            new Date().toISOString();

        const result = db.prepare(`
            INSERT INTO projects (
                title,
                category,
                description,
                budget,
                deadline,
                name,
                phone,
                email,
                created_at
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

        `).run(

            title,
            category,
            description,
            Number(budget),
            deadline || "",
            name,
            phone,
            email || "",
            createdAt

        );

        res.json({

            success: true,

            message:
                "پروژه با موفقیت ثبت شد.",

            projectId:
                result.lastInsertRowid

        });

    } catch (error) {

        console.error(
            "Project registration error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "خطایی در ثبت پروژه رخ داد."

        });

    }

});

// ===============================
// GET ALL PROJECTS
// ===============================

app.get("/api/projects", (req, res) => {

    try {

        const projects = db.prepare(`
            SELECT *
            FROM projects
            ORDER BY id DESC
        `).all();

        res.json({

            success: true,

            projects

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "خطایی در دریافت پروژه‌ها رخ داد."

        });

    }

});

// ===============================
// GET ONE PROJECT
// ===============================

app.get("/api/projects/:id", (req, res) => {

    try {

        const project = db.prepare(`
            SELECT *
            FROM projects
            WHERE id = ?
        `).get(req.params.id);

        if (!project) {

            return res.status(404).json({

                success: false,

                message:
                    "پروژه پیدا نشد."

            });

        }

        res.json({

            success: true,

            project

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "خطایی رخ داد."

        });

    }

});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log("");

    console.log(
        "===================================="
    );

    console.log(
        "        PROJECT HUB SERVER"
    );

    console.log(
        "===================================="
    );

    console.log("");

    console.log(
        `Server running at: http://localhost:${PORT}`
    );

    console.log("");

});