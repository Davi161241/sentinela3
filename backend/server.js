const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();

// =====================================================
// CONFIGURAÇÕES
// =====================================================

app.use(express.json());
app.use(cors());

// =====================================================
// PASTA DO FRONTEND
// =====================================================

app.use(
express.static(
path.join(__dirname, "../frontend")
)
);

// =====================================================
// UPLOAD DE FOTOS
// =====================================================

const uploadsPath =
path.join(__dirname, "uploads");

// Criar pasta uploads se não existir

if (!fs.existsSync(uploadsPath)) {

```
fs.mkdirSync(
    uploadsPath,
    {
        recursive: true
    }
);
```

}

// Configuração do Multer

const storage =
multer.diskStorage({

```
    destination: function (req, file, cb) {

        cb(
            null,
            uploadsPath
        );

    },

    filename: function (req, file, cb) {

        const extensao =
            path.extname(
                file.originalname
            );

        const nomeArquivo =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1E9
            ) +
            extensao;

        cb(
            null,
            nomeArquivo
        );

    }

});
```

const upload =
multer({
storage: storage
});

// Tornar a pasta uploads acessível

app.use(
"/uploads",
express.static(uploadsPath)
);

// =====================================================
// BANCO DE DADOS
// =====================================================

const DB_FILE =
path.join(
__dirname,
"db.json"
);

// =====================================================
// LER BANCO
// =====================================================

function readDB() {

```
if (!fs.existsSync(DB_FILE)) {

    return {

        usuarios: [],

        pacientes: [],

        triagens: [],

        consultas: [],

        tv_chamada: null,

        tv_historico: []

    };

}


const db =
    JSON.parse(
        fs.readFileSync(
            DB_FILE,
            "utf8"
        )
    );


// Garantir estruturas

if (!Array.isArray(db.usuarios)) {
    db.usuarios = [];
}

if (!Array.isArray(db.pacientes)) {
    db.pacientes = [];
}

if (!Array.isArray(db.triagens)) {
    db.triagens = [];
}

if (!Array.isArray(db.consultas)) {
    db.consultas = [];
}

if (!db.tv_chamada) {
    db.tv_chamada = null;
}

if (!Array.isArray(db.tv_historico)) {
    db.tv_historico = [];
}


return db;
```

}

// =====================================================
// ESCREVER BANCO
// =====================================================

function writeDB(data) {

```
fs.writeFileSync(

    DB_FILE,

    JSON.stringify(
        data,
        null,
        2
    ),

    "utf8"

);
```

}

// =====================================================
// LOGIN
// =====================================================

app.post(
"/login",
(req, res) => {

```
    try {

        const db =
            readDB();


        const usuario =
            req.body.usuario;

        const senha =
            req.body.senha;


        const user =
            db.usuarios.find(
                u =>
                    u.usuario === usuario &&
                    u.senha === senha
            );


        if (!user) {

            return res
                .status(401)
                .json({

                    sucesso: false,

                    erro:
                        "Login inválido"

                });

        }


        res.json({

            sucesso: true,

            usuario: user

        });


    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );


        res
            .status(500)
            .json({

                sucesso: false,

                erro:
                    erro.message

            });

    }

}
```

);

// =====================================================
// ATENDIMENTO
// CADASTRAR PACIENTE
// =====================================================

app.post(
"/atendimento",
upload.single("foto"),
(req, res) => {

```
    try {

        console.log(
            "📥 Dados recebidos no atendimento:"
        );

        console.log(
            req.body
        );


        const db =
            readDB();


        // =================================================
        // FOTO
        // =================================================

        let foto = "";


        if (req.file) {

            foto =
                "/uploads/" +
                req.file.filename;

        }


        // =================================================
        // CRIAR PACIENTE
        // =================================================

        const paciente = {

            id:
                Date.now(),

            nome:
                req.body.nome || "",

            cpf:
                req.body.cpf || "",

            rg:
                req.body.rg || "",

            dataNascimento:
                req.body.dataNascimento || "",

            sexo:
                req.body.sexo || "",

            nomeMae:
                req.body.nomeMae || "",

            estadoCivil:
                req.body.estadoCivil || "",

            endereco:
                req.body.endereco || "",

            telefone:
                req.body.telefone || "",

            email:
                req.body.email || "",

            contatoEmergencia:
                req.body.contatoEmergencia || "",

            tipo:
                req.body.tipo || "Convenio",

            foto:
                foto,

            status:
                "triagem",

            createdAt:
                new Date().toISOString()

        };


        // =================================================
        // ADICIONAR AO BANCO
        // =================================================

        db.pacientes.push(
            paciente
        );


        // =================================================
        // SALVAR DB.JSON
        // =================================================

        writeDB(
            db
        );


        console.log(
            "✅ Paciente cadastrado com sucesso:"
        );

        console.log(
            paciente
        );


        // =================================================
        // RESPONDER AO FRONTEND
        // =================================================

        res
            .status(201)
            .json({

                sucesso: true,

                mensagem:
                    "Paciente cadastrado com sucesso.",

                paciente:
                    paciente

            });


    } catch (erro) {

        console.error(
            "❌ ERRO AO CADASTRAR PACIENTE:"
        );

        console.error(
            erro
        );


        res
            .status(500)
            .json({

                sucesso: false,

                erro:
                    erro.message

            });

    }

}
```

);

// =====================================================
// LISTAR PACIENTES
// =====================================================

app.get(
"/pacientes",
(req, res) => {

```
    try {

        const db =
            readDB();


        res.json(
            db.pacientes
        );


    } catch (erro) {

        res
            .status(500)
            .json({

                erro:
                    erro.message

            });

    }

}
```

);

// =====================================================
// TRIAGEM
// =====================================================

app.post(
"/triagem",
(req, res) => {

```
    try {

        const db =
            readDB();


        let risco =
            req.body.risco;


        const temperatura =
            Number(
                req.body.temperatura
            );


        if (temperatura >= 39) {

            risco =
                "vermelho";

        }

        else if (temperatura >= 38) {

            risco =
                "amarelo";

        }

        else if (!risco) {

            risco =
                "verde";

        }


        const triagem = {

            id:
                Date.now(),

            nome:
                req.body.nome || "",

            sintoma:
                req.body.sintoma || "",

            temperatura:
                req.body.temperatura || "",

            alergia:
                req.body.alergia || "",

            observacao:
                req.body.observacao || "",

            risco:
                risco,

            status:
                "aguardando_medico",

            createdAt:
                new Date().toISOString()

        };


        db.triagens.push(
            triagem
        );


        writeDB(
            db
        );


        res
            .status(201)
            .json({

                sucesso: true,

                triagem:
                    triagem

            });


    } catch (erro) {

        console.error(
            "Erro na triagem:",
            erro
        );


        res
            .status(500)
            .json({

                sucesso: false,

                erro:
                    erro.message

            });

    }

}
```

);

// =====================================================
// LISTAR TRIAGENS
// =====================================================

app.get(
"/triagens",
(req, res) => {

```
    try {

        const db =
            readDB();


        res.json(
            db.triagens
        );


    } catch (erro) {

        res
            .status(500)
            .json({

                erro:
                    erro.message

            });

    }

}
```

);

// =====================================================
// TV - CHAMAR PACIENTE
// =====================================================

app.post(
"/tv/chamar",
(req, res) => {

```
    try {

        const db =
            readDB();


        const chamada = {

            id:
                Date.now().toString(),

            localTipo:
                req.body.localTipo,

            localNumero:
                req.body.localNumero,

            paciente:
                req.body.paciente,

            hora:
                new Date().toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )

        };


        db.tv_chamada =
            chamada;


        db.tv_historico.unshift(
            chamada
        );


        if (
            db.tv_historico.length > 5
        ) {

            db.tv_historico.pop();

        }


        writeDB(
            db
        );


        res.json(
            chamada
        );


    } catch (erro) {

        console.error(
            "Erro na chamada da TV:",
            erro
        );


        res
            .status(500)
            .json({

                erro:
                    erro.message

            });

    }

}
```

);

// =====================================================
// TV - CONSULTAR CHAMADA
// =====================================================

app.get(
"/tv/chamada",
(req, res) => {

```
    try {

        const db =
            readDB();


        res.json({

            chamada:
                db.tv_chamada,

            historico:
                db.tv_historico

        });


    } catch (erro) {

        res
            .status(500)
            .json({

                erro:
                    erro.message

            });

    }

}
```

);

// =====================================================
// LISTA DE MEDICAÇÕES
// =====================================================

app.get(
"/lista-medicacoes",
(req, res) => {

```
    res.json([

        "Dipirona",

        "Paracetamol",

        "Ibuprofeno",

        "Amoxicilina",

        "Azitromicina",

        "Loratadina",

        "Omeprazol",

        "Buscopan",

        "Dramin",

        "Soro fisiológico"

    ]);

}
```

);

// =====================================================
// CONSULTA MÉDICA
// =====================================================

app.post(
"/consulta",
(req, res) => {

```
    try {

        const db =
            readDB();


        const consulta = {

            id:
                Date.now(),

            paciente:
                req.body.paciente || "",

            diagnostico:
                req.body.diagnostico || "",

            medicacao:
                req.body.medicacao || "",

            obs:
                req.body.obs || "",

            createdAt:
                new Date().toISOString()

        };


        db.consultas.push(
            consulta
        );


        writeDB(
            db
        );


        res
            .status(201)
            .json({

                sucesso: true,

                consulta:
                    consulta

            });


    } catch (erro) {

        console.error(
            "Erro na consulta:",
            erro
        );


        res
            .status(500)
            .json({

                sucesso: false,

                erro:
                    erro.message

            });

    }

}
```

);

// =====================================================
// MEDICAÇÕES / CONSULTAS
// =====================================================

app.get(
"/medicacoes",
(req, res) => {

```
    try {

        const db =
            readDB();


        res.json(
            db.consultas
        );


    } catch (erro) {

        res
            .status(500)
            .json({

                erro:
                    erro.message

            });

    }

}
```

);

// =====================================================
// ROTA PRINCIPAL
// =====================================================

app.get(
"/",
(req, res) => {

```
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/index.html"
        )
    );

}
```

);

// =====================================================
// SERVIDOR
// =====================================================

const PORT =
process.env.PORT || 3000;

app.listen(
PORT,
"0.0.0.0",
() => {

```
    console.log(
        `🚀 Servidor rodando na porta ${PORT}`
    );

}
```

);
