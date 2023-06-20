const express = require("express");
const exphbs = require("express-handlebars");
const nodemailer = require("nodemailer");
const OAuth2Client = require("google-auth-library")

const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        type: "OAuth2",
        user: "hominhquy17102001@gmail.com",
        clientId: "536456143880-jsmm37fgg8dncrgp6ss2v6a0kpsqr6o4.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken: "1//04d1vimns7-M_CgYIARAAGAQSNwF-L9IrR3WGsRtoE9L5_v1UxtJNNBHv9BBhvjGrg8Lfp6tZbqAF5U-lCIh6Q4kFTvHrAiVvLtk",
    },
});

const app = express();
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.use(express.json());


const port = 3000;
app.listen(port, () => console.log(`Server now is at ${port}`));
const { Client } = require('pg');
const e = require("express");
const client = new Client({
    user: 'nhat',
    host: 'dev.smartlook.com.vn',
    database: 'db_tramcan1',
    password: 'Spkt1234',
    port: 59103,
});
client.connect();
app.get("/", (req, res) => { res.render("login") })

app.get("/main", (req, res) => {
    if (isLoggedIn) {
        client.query(`SELECT "TenKieuCan", "SoLanCan" FROM public."KieuCan" WHERE "TenKieuCan" = 'NHẬP' OR "TenKieuCan" = 'XUẤT'`, (err, result) => {
            if (!err) {
                const test = result.rows;

                // Tạo mảng nhap và tính tổng
                const nhap = test.filter(item => item.TenKieuCan === 'NHẬP').map(item => item.SoLanCan);
                // Tạo mảng xuat và tính tổng
                const xuat = test.filter(item => item.TenKieuCan === 'XUẤT').map(item => item.SoLanCan);


                // Thực hiện truy vấn mới
                client.query(`SELECT "TenLoaiHang", "KhoiLuongHang" FROM public."LoaiHang"`, (err, result) => {
                    if (!err) {
                        const loaihang = result.rows;

                        res.render("index", { nhap: nhap, xuat: xuat, loaihang, isLoggedIn });
                    } else {
                        console.error(err);
                        res.render("index", { nhap: nhap, xuat: xuat, loaihang: [], isLoggedIn });
                    }
                });
            }
        });
    } else {
        res.redirect("/login");
    }
});



app.get("/register", (req, res) => {
    client.query(`SELECT "Id", "Ma", "TenLoaiHang", "DonGia", "KhoiLuongHang", "GhiChu"
	FROM public."LoaiHang";`, (err, result) => {
        if (!err) {
            res.render("DangKy", { dangky: result.rows, isLoggedIn });
        }
        else {
            console.log(err.message);
            res.end();
        }
    });
});
app.post("/register", urlencodedParser, (req, res) => {
    const hoten = req.body.hoten && req.body.hoten.toUpperCase() || "";
    const sdt = req.body.sdt && req.body.sdt.toUpperCase() || "";
    const tendoanhnghiep = req.body.tendoanhnghiep && req.body.tendoanhnghiep.toUpperCase() || "";

    const city = req.body.city && req.body.city.toUpperCase() || "";
    const distr = req.body.distr && req.body.distr.toUpperCase() || "";
    const ward = req.body.ward && req.body.ward.toUpperCase() || "";
    const address = city + ", " + distr + ", " + ward;

    const loaihang = req.body.loaihang && req.body.loaihang.toUpperCase() || "";
    const dongia = req.body.dongia && req.body.dongia.toUpperCase() || "";
    const date = req.body.date && req.body.date.toUpperCase() || "";
    const laixe = req.body.laixe && req.body.laixe.toUpperCase() || "";
    const biensodau = req.body.biensodau && req.body.biensodau.toUpperCase() || "";
    const biensoduoi = req.body.biensoduoi && req.body.biensoduoi.toUpperCase() || "";
    const ID = req.body.ID && req.body.ID.toUpperCase() || "";
    const xuatnhap = req.body.xuatnhap && req.body.xuatnhap.toUpperCase() || "";
    const cmnd = req.body.cmnd && req.body.cmnd.toUpperCase() || "";
    const khoiluong = req.body.khoiluong && req.body.khoiluong.toUpperCase() || "";
    const email = req.body.email && req.body.email.toUpperCase() || "";

    client.query(`INSERT INTO public."DangKy"(
            "ID", "HoTen", "DiDong", "TenDoanhNghiep", "DiaChi", "LoaiHang", "DonGia", "Date", "TenLaiXe", "BienSoDau", "BienSoDuoi", "TrangThai", "XuatNhap", "CMND", "KhoiLuong")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`, [ID, hoten, sdt, tendoanhnghiep, address, loaihang, dongia, date, laixe, biensodau, biensoduoi, "Chưa xác nhận", xuatnhap, cmnd, khoiluong])

    const mailOptions = {
        from: "hominhquy17102001@gmail.com",
        to: email,
        subject: "Đăng ký thành công",
        text: "Dear " + req.body.hoten + "\n\nBạn đã đăng ký thành công với mã đơn hàng là: " + ID + "\n\nBạn có thể tra cứu thông tin và trạng thái đơn hàng ở đây http://localhost:3000/search. Vui lòng thông báo mã đơn của bạn cho nhân viên trạm cân.\n\nNếu có sai sót gì vui lòng liên hệ:0808366424 (Mr.Quy) hoặc 0332528055(Mr.Nhat)\n\nTrân Trọng!",
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send("Có lỗi xảy ra khi gửi email.");
        } else {
            console.log("Email đã được gửi: " + info.response);
            res.status(200).send("Email đã được gửi thành công.");
        }
    });

    res.redirect('/register');


})
app.get("/about", (req, res) => { res.render("about", { isLoggedIn }) });
app.get("/thongke/khachhang", (req, res) => {
    if (isLoggedIn) {
        client.query(`SELECT "MaKH", "TenKhachHang", "DtKH", "DiaChiKH", "CMNDKH", "NgayCapKH", "NoiCapKH", "GhiChu"
    FROM public."KhachHang";`, (err, result) => {
            if (!err) {
                res.render("KhachHang", { khachhang: result.rows, isLoggedIn });
            }
            else {
                console.log(err.message);
                res.end();
            }
        });
    } else {
        res.redirect("/login");
    }
});
app.get("/thongke/loaihang", (req, res) => {
    if (isLoggedIn) {
        client.query(`SELECT "Id", "Ma", "TenLoaiHang", "DonGia", "KhoiLuongHang", "GhiChu"
	FROM public."LoaiHang";`, (err, result) => {
            if (!err) {
                res.render("LoaiHang", { loaihang: result.rows, isLoggedIn });
            }
            else {
                console.log(err.message);
                res.end();
            };
        });
    } else {
        res.redirect("/login");
    }
});
app.get("/thongke/nguongoc", (req, res) => {
    if (isLoggedIn) {
        client.query(`SELECT "Id", "Ma", "TenNGHH", "GhiChu"
	FROM public."NguonGocHangHoa";`, (err, result) => {
            if (!err) {
                res.render("NguonGoc", { nguongoc: result.rows, isLoggedIn });
            }
            else {
                console.log(err.message);
                res.end();
            }
        });
    } else {
        res.redirect("/login");
    }
});
app.get("/thongke/phuongtien", (req, res) => {
    if (isLoggedIn) {
        client.query(`SELECT "Id", "BienSoDauXe", "BienSoCuoiXe", "TrongTai", "TenChuXe", "SoDienThoai", "CMND", "MaTheXe", "GhiChuXe"
	FROM public."Vehicle";`, (err, result) => {
            if (!err) {
                res.render("PhuongTien", { phuongtien: result.rows, isLoggedIn });
            }
            else {
                console.log(err.message);
                res.end();
            }
        });
    } else {
        res.redirect("/login");
    }
});
app.get("/thongke/khohang", (req, res) => {
    if (isLoggedIn) {
        client.query(`SELECT "Id", "MaKhoHang", "TenKhoHang", "DiaChiKhoHang", "GhiChu"
	FROM public."KhoHang";`, (err, result) => {
            if (!err) {
                res.render("KhoHang", { khohang: result.rows, isLoggedIn });
            }
            else {
                console.log(err.message);
                res.end();
            }
        });
    } else {
        res.redirect("/login");
    }
});
app.get("/thongke/thongtincanxe", (req, res) => {
    if (isLoggedIn) {
        client.query(`SELECT "Id", "TenLaixe", "KhachHang", "LoaiHang", "KhoHang", "NguonGoc", "KieuCan", "ChatLuongHH", "BienSoDauXe", "BienSoDuoiXe", "KhoiLuongTapChat", "KhoiLuongL1", "KhoiLuongL2", "KhoiLuongHang", "ThoiGianCanL1", "ThoiGianCanL2", "DonGia", "ThanhTien", "GhiChu", anh1, anh2, anh3, anh4, anh12, anh22, anh32, anh42
	FROM public."TTCanXe";`, (err, result) => {
            if (!err) {
                res.render("ThongTinCanXe", { ttcanxe: result.rows, isLoggedIn });
            }
            else {
                console.log(err.message);
                res.end();
            }
        });
    } else {
        res.redirect("/login");
    }
});
app.get("/accept", (req, res) => {
    if (isLoggedIn) {
        client.query(`SELECT "ID", "HoTen", "DiDong", "TenDoanhNghiep", "DiaChi", "LoaiHang", "DonGia", "Date", "TenLaiXe", "BienSoDau", "BienSoDuoi", "TrangThai", "XuatNhap", "CMND", "KhoiLuong"
	FROM public."DangKy";`, (err, result) => {
            if (!err) {
                res.render("XacNhan", { xacnhan: result.rows, isLoggedIn });
            }
            else {
                console.log(err.message);
                res.end();
            };
        });
    } else {
        res.redirect("/login");
    }
});
app.get("/logout", (req, res) => {
    isLoggedIn = false;
    loggedInUser = '';
    res.redirect('/login');
});
app.post("/accept", urlencodedParser, (req, res) => {
    const id = req.body.id;
    const trangThai = "Đã xác nhận";
    client.query(`UPDATE public."DangKy" SET "TrangThai" = $1 WHERE "ID" = $2`, [trangThai, id], (err, result) => {
        if(id==false){
            res.end();
        }
        if (!err) {
        } else {
            console.log(err.message);
            res.send("Không thể xác nhận");
        }
    }
    );
});
app.get("/search", (req, res) => {
    const keyword = req.query.keyword;
    client.query(`SELECT * FROM public."DangKy" WHERE "ID" = $1`, [keyword], (err, result) => {
        if (!err) {
            res.render("TraCuu", { tracuu: result.rows, isLoggedIn });
        } else {
            console.log(err.message);
            res.end();
        }
    });
});
app.get("/login", (req, res) => {
    res.render("login");
});

let isLoggedIn = false;
let loggedInUser = '';

app.post('/login', urlencodedParser, (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT "Name", "Password" FROM public."User" WHERE "Name" = $1 AND "Password" = $2`;
    const values = [username, password];

    client.query(query, values)
        .then(result => {
            const user = result.rows[0];
            if (user) {
                isLoggedIn = true;
                loggedInUser = user.Name;
                res.redirect('/main');
            } else {
                res.render('login', { error: 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng nhâp lại' });
            }
        })
        .catch(error => {
            console.log(error);
            res.redirect('/login');
        });
});

app.use((req, res, next) => {
    res.locals.isLoggedIn = isLoggedIn;
    res.locals.loggedInUser = loggedInUser;
    next();
});
console.log(isLoggedIn);

