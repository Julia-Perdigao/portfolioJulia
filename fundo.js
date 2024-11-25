var canvas = document.createElement("canvas");
var width = canvas.width = window.innerWidth * 0.75;
var height = canvas.height = window.innerHeight * 0.75;
document.body.appendChild(canvas);
var gl = canvas.getContext('webgl');

// Definir o fundo do WebGL como transparente
gl.clearColor(0.0, 0.0, 0.0, 0.0); // Transparente (RGBA)

// Aplique a limpeza da tela para garantir que o fundo seja transparente
gl.clear(gl.COLOR_BUFFER_BIT);

var mouse = {x: 0, y: 0};

var numMetaballs = 30;
var metaballs = [];

for (var i = 0; i < numMetaballs; i++) {
    var radius = Math.random() * 60 + 10;
    metaballs.push({
        x: Math.random() * (width - 2 * radius) + radius,
        y: Math.random() * (height - 2 * radius) + radius,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        r: radius * 0.75
    });
}

var vertexShaderSrc = `
attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

var fragmentShaderSrc = `
precision highp float;

const float WIDTH = ` + (width >> 0) + `.0;
const float HEIGHT = ` + (height >> 0) + `.0;

uniform vec3 metaballs[` + numMetaballs + `];

void main() {
    float x = gl_FragCoord.x;
    float y = gl_FragCoord.y;

    // Cor de fundo - transparente
    vec3 backgroundColor = vec3(0.0, 0.0, 0.0); // #000000 (cor preta transparente)

    float sum = 0.0;
    for (int i = 0; i < ` + numMetaballs + `; i++) {
        vec3 metaball = metaballs[i];
        float dx = metaball.x - x;
        float dy = metaball.y - y;
        float radius = metaball.z;

        sum += (radius * radius) / (dx * dx + dy * dy);
    }

    // gradiente nas bolinhas
    vec3 color1 = vec3(0.741, 0.0, 1.0); // #bd00ff
    vec3 color2 = vec3(0.373, 0.321, 0.812); // #5f52cf

    // gradiente radial
    float dist = length(vec2(x, y) - vec2(WIDTH / 2.0, HEIGHT / 2.0)) / (WIDTH / 2.0);
    vec3 metaballColor = mix(color1, color2, smoothstep(0.0, 1.0, dist));

    if (sum >= 0.99) {
        gl_FragColor = vec4(mix(metaballColor, vec3(0, 0, 0), max(0.0, 1.0 - (sum - 0.99) * 100.0)), 1.0);
        return;
    }

    gl_FragColor = vec4(backgroundColor, 0.0); // Alpha = 0.0 para transparência
}
`;

var vertexShader = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
var fragmentShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

var vertexData = new Float32Array([
    -1.0,  1.0, // top left
    -1.0, -1.0, // bottom left
    1.0,  1.0, // top right
    1.0, -1.0, // bottom right
]);
var vertexDataBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

var positionHandle = getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionHandle);
gl.vertexAttribPointer(positionHandle,
                       2, // position is a vec2
                       gl.FLOAT, // each component is a float
                       gl.FALSE, // don't normalize values
                       2 * 4, // two 4 byte float components per vertex
                       0 // offset into each span of vertex data
                      );

var metaballsHandle = getUniformLocation(program, 'metaballs');

loop();
function loop() {
    for (var i = 0; i < numMetaballs; i++) {
        var metaball = metaballs[i];
        metaball.x += metaball.vx;
        metaball.y += metaball.vy;

        if (metaball.x < metaball.r || metaball.x > width - metaball.r) metaball.vx *= -1;
        if (metaball.y < metaball.r || metaball.y > height - metaball.r) metaball.vy *= -1;
    }

    var dataToSendToGPU = new Float32Array(3 * numMetaballs);
    for (var i = 0; i < numMetaballs; i++) {
        var baseIndex = 3 * i;
        var mb = metaballs[i];
        dataToSendToGPU[baseIndex + 0] = mb.x;
        dataToSendToGPU[baseIndex + 1] = mb.y;
        dataToSendToGPU[baseIndex + 2] = mb.r;
    }
    gl.uniform3fv(metaballsHandle, dataToSendToGPU);
  
    // Desenhar
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Solicitar o próximo quadro
    requestAnimationFrame(loop);
}

function compileShader(shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
    }

    return shader;
}

function getUniformLocation(program, name) {
    var uniformLocation = gl.getUniformLocation(program, name);
    if (uniformLocation === -1) {
        throw 'Cannot find uniform ' + name + '.';
    }
    return uniformLocation;
}

function getAttribLocation(program, name) {
    var attributeLocation = gl.getAttribLocation(program, name);
    if (attributeLocation === -1) {
        throw 'Cannot find attribute ' + name + '.';
    }
    return attributeLocation;
}

canvas.onmousemove = function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}