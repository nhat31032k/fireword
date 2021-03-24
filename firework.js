const WIDTH = 1400;
const HEIGHT = 800;
const PARTICLE_SIZE = 8;
const PARTICLE_CHANGE_SIZE_SPEED = 0.1;
const PARTICLE_CHANGE_SPEED = 0.3;
// giá trị của gia tốc
const ACCELERATION = 0.1;
// giá trị tốc độ của các hạt  con
const DOT_CHANGE_SIZE_SPEED = 0.05;
// ?GIÁ TRỊ ĐỘ MỜ
const DOT_CHANGE_ALPHA_SPEED = 0.05;
// giá trị tốc độ của hạt nhỏ nhất
const PARTICLE_MIN_SPEED = 14;
// giá trị tạo ra số hạt nhỏ của 1 viên đạn
const NUMBER_PARTICLE_PER_BULLET = 25;
// hạt đạn nhỏ pháo hoa tỏa ra pháo hoa tỏa ra
class particle {
    // cho hạt thuộc quả đạn và có góc để bắn ra
    constructor(bullet, deg) {
        this.bullet = bullet;
        this.ctx = bullet.ctx;
        this.deg = deg;
        this.color = this.bullet.color;
        // tọa độ của hạt sẽ bằng tọa độ của viên đạn
        this.x = this.bullet.x;
        this.y = this.bullet.y;
        // độ to của hạt
        this.size = PARTICLE_SIZE;
        // cạnh huyền và cũng là tốc độ bắn của hạt 
        this.speed = Math.random() * 4 + PARTICLE_MIN_SPEED;
        // cạnh x
        this.speedx = 0;
        // cạnh y
        this.speedy = 0;
        // tốc độ rơi 
        this.fallspeed = 0;
        // tạo ra các chấm (các hạt rơi xuống sẽ có những chấm sau đuôi)
        this.dots = [];
    }
    update() {
            // cho tốc độ bắn ra sẽ nhanh sau đó giảm dần
            this.speed -= PARTICLE_CHANGE_SPEED;

            if (this.speed <= 0) {
                this.speed = 0;

            }
            // mỗi lần update sẽ tạo ra 1 gia tốc mới 
            this.fallspeed += ACCELERATION;
            // tính tốc độ bắn ra hướng x và y áp dụng hệ thức lượng tam giác vuông
            this.speedx = this.speed * Math.cos(this.deg);
            this.speedy = this.speed * Math.sin(this.deg) + this.fallspeed;

            // tính hướng bắn ra
            this.x += this.speedx;
            this.y += this.speedy;
            // MỖI LẦN XUẤT HIỆN NÓ SẼ GIẢM KÍCH THƯỚC
            if (this.size > PARTICLE_CHANGE_SIZE_SPEED) {
                this.size -= PARTICLE_CHANGE_SIZE_SPEED;
            }
            // khi update nếu hạt mà còn hiện lên trên màn hình thì sẽ thêm cái đuôi hạt vào các hạt to
            if (this.size > 0) {
                this.dots.push({
                    // ở đây x và y sẽ lấy tọa độ của cái hạt để chạy theo viên đạn
                    x: this.x,
                    y: this.y,
                    alpha: 1,
                    size: this.size
                });
            }
            // mỗi lần update thì cái đuôi nó mờ đi
            this.dots.forEach(dot => {
                // giảm kích thước
                dot.size -= DOT_CHANGE_SIZE_SPEED;
                // giảm độ mờ 
                dot.alpha -= DOT_CHANGE_ALPHA_SPEED;
            });
            // lọc ra các chấm > 0
            this.dots = this.dots.filter(dot => {
                return dot.size > 0;
            });
            // xóa các hạt có tốc độ dưới 0
            if (this.dots.length == 0) {
                this.remove();
            }
        }
        // hàm xóa các hạt có tốc độ dưới 0
    remove() {
        // xóa các hạt có trong viên đạn
        this.bullet.particles.splice(this.bullet.particles.index(this), 1);
    }
    draw() {
        this.dots.forEach(dot => {
            // set màu cho hình
            this.ctx.fillStyle = 'rgba(' + this.color + ',' + dot.alpha + ')';
            // vẽ ra 1 cái hình tròn
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, dot.size, 0, 2 * Math.PI);
            this.ctx.fill();
        })

    }
}
// đạn pháo hoa 
class bullet {
    constructor(fireworks) {
        // khởi tạo nhiều bắn ra viên đạn 
        this.fireworks = fireworks;
        this.ctx = fireworks.ctx;
        // khởi tạo độ của viên đạn và set màu cho nó 
        this.x = Math.random() * WIDTH;
        this.y = Math.random() * HEIGHT;
        // hàm math random sẽ trả về giá trị từ 0-255 đây cũng là tượng trưng cho dãy màu rgba
        this.color = Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255);
        // 1 viên đạn sẽ chứa nhiều hạt nhỏ 
        this.particles = [];
        // độ của 1 viên đạn dựa theo hình tròn là 2pi mà bao nhiu viên tạo ra thì chia cho bấy nhiu 
        let bulletDeg = Math.PI * 2 / NUMBER_PARTICLE_PER_BULLET;
        // tạo n viên đạn nhỏ và cho nó hướng để bắn ra 
        for (let i = 0; i < NUMBER_PARTICLE_PER_BULLET; i++) {
            let newParticle = new particle(this, i * bulletDeg);
            this.particles.push(newParticle);
        }
    }
    remove() {
        this.fireworks.bullet.splice(this.fireworks.bullet.index(this), 1);
    }
    update() {
        // đạn nổ xong xóa đi
        if (this.particles.length == 0) {
            this.remove();
        }
        // khi update viên đạn thì các viên nhỏ cũng sẽ update theo
        this.particles.forEach(particle => particle.update());
    }
    draw() {
        this.particles.forEach(particle => particle.draw());
    }
}

// cấu trúc pháo hoa 
class fireworks {
    constructor() {
            // khởi tạo viên pháo qua canvas
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = WIDTH;
            this.canvas.height = HEIGHT;
            document.body.appendChild(this.canvas);
            // tạo mảng 
            this.bullets = [];
            // tạo 1 viên đạn mới 
            // cho lặp lại viên pháo hoa
            setInterval(() => {
                let newBullet = new bullet(this);
                this.bullets.push(newBullet);
            }, 1500);

            this.loop();
        }
        // cho pháo hoa lặp lại nhiều lần 
    loop() {
            // lặp lại từng viên đạn 1
            this.bullets.forEach(bullet => bullet.update());
            // console.log('loop');
            this.draw();
            setTimeout(() => this.loop(), 20);
        }
        // dùng hàm xóa màn hình mỗi khi refresh lại 
    clearScreen() {
            // xóa cho màn hình thành màu đen
            this.ctx.fillStyle = '#000000';
            // sau đó vẽ ra hình chữ nhật 
            this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }
        // dùng hàm draw để vẽ pháo hoa
    draw() {
        this.clearScreen();
        this.bullets.forEach(bullet => bullet.draw());

    }
}

var f = new fireworks();