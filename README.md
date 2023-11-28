# SERVIDOR EN CAPAS COMPLETO CON TICKETS CONTROL DE ERRORES, LOGGER Y RECUPERACION DE CONTRASEÑA MAS MULTER

El propósito de este proyecto es realizar un servidor completo por capas; que cuente con la posibilidad de crear un ticket de compra, y proveer del manejo de errores.

## SELECCION DEL ENTORNO

Para este caso se emplea la dependencia de **commander** para realizar la captura de los argumentos que se colocan despues de node y el index.js en el CLI **node index.js**.

Se peude seleccionar el entorno empleando **-m** o **--mode**, y para seleccionar el entorno el argumento **dev** para desarrollo o **prod** para produccion; de forma predeterminada, si no se coloca algun argumento, el index.js se ejecuta en modo de desarrollo

```javascript

const program = new Command()

//Selección de entorno de ejecución (dev: Development, prod: production)
program
    .option('-m, --mode <mode>', 'environment working mode', 'dev')
program.parse(process.argv)

```

Una vez que el program toma el argumento de selección de entorno, se y se toman las opciones, donde se almacena el objeto con los argumentos como valor y las opciones como key. Con esto se en el archivo de configuración de variables de entorno **config.env.js**, se realiza la selección del entorno.

## MANEJO DE ERRORES

Para el caso del manejo de errores, se crea un diccionario con los error mas comunes en **/src/util/errorHandler**, con el nombre de **errorHandler.enums.js**. Se crea una clase llamada **errorHandler.customErrors.js**, ubicada en la misma ruta de carpetas; esta clase realiza una construcción personalizada del error, tomando los códigos de error del diccionario, creando un error mediante la clase **CustomizedError**, de la forma:

```javascript

const error = new Error(message, {cause})
error.name = name
error.code = code
throw error

```

Los errores pesonalizados tienen salida a través de un **console.log** que se encuentra en el catch de la función asincrona del controlador correspondiente, usando la función **generateErrorInfo** que se encuentra en el archivo **errorHandler.info.js**, dentro de la ubicación anterior, para agregar la causa de la siguiente forma:

Creación de error en el controller, dentro del try de la función asincrona:

```javascript

CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_CID_ERROR, data_de_validacion),
                message: 'No se cuenta con el parámetro cid para borrar el cart',
                code: EError.CART_INVALID_CID_ERROR
            })

```

Por otro lado, a fin de que el middleware de errores funcione correctamente, se agrega el parámetro next en cada ruta de los controladores, y dentro de cada catch se ejecuta como next(err).

```javascript

catch(err) {
        console.log('\x1b[31mInformación del Error\n' + err + '\n\x1b[33m[code:] ' + err.code + '\n\x1b[32m[casue:] ' + err.cause + '\x1b[0m')
        next(err)
    }

```


## ROLES DE USUARIO

SE cuenta con 2 roles de usuario, los cuales son llamados **USUARIO** y **PREMIUM**. Los usuarios premium tienen el privilegio de poder publicar articulos para su venta; sin embargo al momento de realizar la compra de sus propios articulos, estan bloquedado para no poder hacerlo. Los productos que se den de alta con el usuario premium tendran un campo en la colección de productos llamada **owner** donde se coloca el correo electronico del usuario premium.

Se puede realizar el cambio entre usuario estandar y usuario premium mediante la ruta:

```javascript

userRouter.post('/premium/:uid', passport.authenticate('jwtAuth', {session:false}), updateUserRollController)

```

donde uid, es el ID del usuario. y para poder hacer el cambio se tiene una política de restricción donde el usuarionde debe de estar logueado para poder hacer este cambio

SE cuenta con un rol de administrador, el cual tiene provilegios para eliminar carts y productos, o para dar de alta productos, actualizar productos, etc., tanto los dados de alta pro el administrador como por un usuario premium.



## SISTEMA DE RECUPERACION DE CONTRASEÑA

El sistema consiste en un enlace que encuentra en el login, donde se redirecciona hacia una pagina donde solicitará el correo electrónico registrado, para poder realizar la recuperación.

para realizar esto se crea una coleccion en la base de datos que contendrá el id del link el cual se generará de forma aleatoria, el correo del usuario, el tiempo de inicio y tiempo final de aproximadamente una hora mas. para ello se crea un modelo con mongoose llamado Recovery

```javascript

const recoverySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    startTime: {
        type: Number,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    }
})

```

Este modelo conecta hacia la colección llamada **recoveries**.

Mediante el uso de **nodemailer**, se realiza el envío de un correo electrónico con un botón para poder realizar la recuperación, este boto tiene un formulario qu dispara un router con el método GET hacia la ruta **/recoveryPassLink/:link**; donde link es el id del link generado automáticamente.

Por lo que el sistema de recuperación de contraseña consiste en realizar el cambio de la contraseña a través de un formulario que tiene dos campos para realizar la confirmación de la contraseña nueva, por lo que mediante javascript y eventos se realiza comparación de ambos campos; es importante retirar el foco del campo de confirmación para que se dispare el evento de comparación.

Posteriormente, con la contraseña nueva y el id del link, se obtiene la información de la colección recoveries para obtener nuevamente el e-mail de usuario; y con esto obtener la información del usuario para realizar la verificación de la contraseña del usuario. En caso de que sea la misma se le informará que esa contraseña ha sido empleada anteriormente, por lo que hasta que ya se lanza la contraseña diferente es cuando se manda a llamar a la ruta para realizar el cambio de contraseña en la base de datos.

Si el cambio fue exitoso, se le informara al cliente.



## SERVIDOR

En primer lugar se establece una capa de conexión a base de datos llamada db, la cual tiene el proporsito de realizar la conexión hacia MongoDB, a través del URL que se obstiene mediante MongoDB.

En la segunda capa se encuentra el DAO, el cual es seleccionado a través del sistema de **Factory**, donde se selecciona el DAO a emplear, ya sea por File System el cual tiene por nombre FileDAO, o a traves de la base de datos MongoDB, el cual se llama mongoDAO.

Por default se encuentra seleccionada la opción de usar el mongoDAO a través de las variables de .env. Tomar encuenta que si se cambia el DAO hacia FileDAO, no esta completo uso de las clases para usar un DAO con File System, y solo se usa amanera de representación de la posibilidad de hacer la selección.

En el tercer plano se establece la capa de modelo que se encarga de definir los modelos para:
    
    - Usuarios
    - Productos
    - Carts
    - mensajes del Chat
    - Ticket de compra

Se modelan los esquemas de los datos que se agragaran a la base detos y a través de estos mismos se realiza la solcitud de datos a la DB.

Dentro del modelado de datos se incorpora en los modelos de carts, users y ticket el uso de **populate**, mendiante el método **findOne**, a fin de hacer una referencia usando los ID's de productos, y obtener la información completa de cada producto. Este tipo de referencias se realiza para no sbrecargar de información en cada colección de la base de datos.

El cuarto plano se integra un capa de servicios, la cual se encarga de la lógica para realizar la gestión hacia la base de datos de:

1. Autenticación de usuarios: Dentro de este servicio se realiza el registro y proceso de login del usuario, ya que realiza la la lógica de gestion y la conexión mediante el modelo correspondiente. **Es importante hacer notar que al momento de crear el usuario, también se crea un cart de compra, esto con fin de asociar el usuario con el carrito de compra desde un incio**.

2.  Productos: Se encarga de realizar la conexión hacia la DB mediante el modelo de products, y se tendrá la lógica para poder agregar un productos nuevo, o solicitar una contidad de productos de acuerdo a un limite o paginación, también se puede realizar la solicitud de un productos por su id, o borrar un producto.

3. Cart: De la misma forma que en el servicio de productos, en este servicio se establece la lógica y gestion hacia la DB, a través del modelo; para realizar la creación de un carrito nuevo de compra, agregar productos a un carrito ya creado, borrar productos del carrito, modficar la cantidad el producto ya agregado y borrar el carrito de compra. 

Además a través del servicio de carts, se puede realizar el proceso de la compra mediante el métodp de purchaseCartService; donde se realizan los procesos de:

    - Disminución del Stock de producto
    - Eliminar el producto con existencia de cart
    - Separar los IDs de productos que no cuentan con stock suficiente
    - Generación del ticket de compra

La ruta de acceso a este endpoint de servicio es através de la ruta de desarrollo:

[http://localhost:(puerto)/api/carts/(cid)/purchase]

donde puerto, es el puerto http donde esta operando el servidor, y cid es el ID del cart del usuario.

En este endpoint se usa el método POST para poder realizar el proceso, devolviendo como payload, el ticket y un arreglo de IDs productos sin stock suficiente.

En la quinta capa se tienen los controladores, que se encargan de hacer la integración de la capa de servicios hacia los routers.

1. Controlador de autenticación de usuarios: Se encarga de realizar la toma de los datos que se entregan por el servicio de autenticación y realizar el direccionamiento correspondiente, ya se hacia el login o hacia los productos una vez que el usuario se haya autenticado correctamente.

2. Controlador de productos: Se encarga recibir los datos entregados por el servicio de productos y entregarlos, si asi es el caso hacia los routers. Por otro lado, también encarga de recibir los datos ya sea por los request de body, params o query, entregarlos hacia el servicio y posteriormente se envien hacia la base de datos.

3. Controlador de Carts: De la misma forma que con el de productos, se integran los servicios del cart hacia el router. De taforma que se reciban los datos del servicio, o se entreguen la información recibida por los request de body, o params; y realizar el proceso de compra.

4. Controlador de vistas: Se encarga de realiza los redirecionamiento correspondiente hacia las vista solicitada mediante el router de vistas.

5. Controlador de github: Se encarga de hacer la gestion mediante la configuración para github que hace la gestion del usuario registrado en github y poderse autenticar. El controlador se encarga de almacenar en sesion los datos de usuario y enviar un token hacia el router de autenticación.

En la sexta capa, esta los routers que se encargar del manejo de los métodos que usaran los endpoints para la entrega o recepción de datos; o para hacer el direccionamiento hacia las vista.

## EXPRESS SESSION

Para poder realizar el manejo de la sesión para el manejo de datos de usuario, se ocupa express-session, habilitando el middleware mediante app.use, usando el siguiente código en el index.js

```javascript

app.use(session({
    secret: 'secrecto de encriptación',
    resave: true,
    saveUninitialized: true
}))

```

La persistencia de la sesión se realiza con la dependencia connect-mongo, hacia la base de datos de MongoDB y la colección por default de **sessions**.

## CONNECT-MONGO

La persistencia de la sesión se realza medniante la conexión a la base de datos mongoDB, en la colección por defecto **sessions**, por lo que al objeto que se usa como parámentro de session, se agrega el key store, indicando que el almacenamiento de la sesión será en MongoDB.

```javascript

app.use(session({
     store: MongoStore.create({
        mongoUrl: 'URL de la base de datos en MongoDB ',
    }),
    secret: 'secrecto de encriptación',
    resave: true,
    saveUninitialized: true
}))

```


## HANDLEBARS (MOTOR DE PLANTILLAS)

Mediante el uso de handlebars como motor de plantillas, para crear una página estática para un chat, donde la comunicación se realiza a través de websockets, donde se crea un formulario para recibir los datos del nombre de usuario que es el correo electrónico del usuario mediente un form input, y el texto del mensaje a través de un texarea. Se realiza un submit de estos datos usando un botón que dispara el evento submit; el formulación a su vez ejecuta el evento onsubmit que ejecuta la función correspondiente para dar formato al mensaje, mediante el objeto messaging como **{user: recibe el valor del input box username, message: recibe el valor del textarea usermessage}**.

Para essto se crea una carpeta de vistas llamada **views**, en la ruta raíz, donde se alberga el archivo **main.handlebars.js** en la carpeta de **layout**; por otro lado en la crapeta de views, se crea el archivo **chat.handlebars.js**, donde realiza el diseño del formulario.

Para la vista de products, se crea un router de productos a través del cual se direccionará hacia la ruta de la vista de productos, ubicado en **/products**; y mediante el uso de un archivo **products.handlebars**, se colocan las etiquetas html para colocar los botones de visualizar el carrito, pagina siguiente y pagina anterior, y el render de las trajetas de productos. La lógica se realizará desde el archivo **products.js**, donde se albergará las líneas de código para realizar los fetch correspondientes hacia la base de datos, colección products y poder descargar los documentos correspondientes a los productos existentes mediante el método get, para poder visualizarlos en la vista de productos. Ademas dentro de esta vista será posible agregar los productos de uno en uno al carrito de compra y almacenarse en la base de datos de la colección carts, através de uso del metodo put, y crear un nuevo carrito mediante el metodo post; estos métodos realizan un fetch hacia los endpoints correspondientes.

El el archivo productos.js, se cuenta con una variable global cartId que es el id de carrito de compras, de momento este valor está inicializado con el id de un carrito que esta en la base da datos MongoDB Atlas, de la collección carts con id **'64b522c4d5b51e2d98a0fa81'**, por lo que si se quiere interactuar con la creación de un nuevo carrito cada vez que se recargue la pagina, se tendra que inicializar con el valor de **undefined**.


Para la vista de carts, de la misma forma se cre aun router para direccionar hacia la vista de cart, ubicado en **/carts/:cid**, donde cid representa el cart actual de compra, es valor se carga de forma automática cuando da clic en el boton de viaualizar carrito en la vista de productos, el cual abrira una pestaña nueva con la vista del carrito mostrando los datos generales del producto, los cuales se descargan de la base de datos, de la colección carts, mediante el fetch hacia el endpoitn correspondiente.

Además, se implementa una vista de autenticación para realizar:

- Login. Se usa formulario con método POST hacia el endpoint de **/authLogin**, que verifica si el usuario está registrado en la base de datos. Dentro de esta vista se agrega un botón para realizar la autenticación de terceros hacia github.
    
- Registro de usuario. De igual forma se usa un formulario con método POST hacia el endpoint de **/authRegistration**, donde se hace el registro de usuario hacia la base de datos.


## WEBSOCKETS

Se usará la aplicación de sockets.io para realizar la comunicación a través de http 8080. Del lado del servidor se crea un router que contendrá en endpoint GET, llamado **chat.router.js** como función que recibirá desde el index.js del servidor, ubicado en la ruta raíz, la constante **io** que recibe **socket.io**. 

En el endpoint, se realiza la recepción del mensaje enviado por el cliente medinate el evento **chatMessage**, este mensage se almacena en un array llamado **allMessages**, donde se realuzará el push de los mensajes envien los clientes; posteriormente se emitirá a los clientes, mediante el evento **allMessages**, para mostrar el seguimiento de los mensajes. Una vez cerrada la conexión por parte de cliente mediante el botón de **Finalizr chat** que dispara la función **socket.disconnect()** del lado del cliente, se almacenarán los mensajes en el mongoDB Atlas, en una colleción llamada messages.

Por el lado del cliente, socket.io, se instala mediante el uso del script **<script src="/socket.io/socket.io.js"></script>**, colocado en el archivo de chat.handlebars.js; por otro lado se usa el archivo **chat.js** para realizar la lógica de programación, para instanciar socket.io mediante la constante **socket**,  recibir los datos del formulario, formateo y creación del objeto de messaging, y emisión hacia el servidor mediante el evento **chatMessage** enviando el objeto messaging. También se realiza la función para recibir el evento **allMessages** enviado por el servidor con el arreglo de los mensajes a cumulados, y relizar el render de la vista de los mensajes; y la función para deconexión del cliente y poder enviar los mensajes acumulados a la base de datos mongoDB Atlas en la colección messages.

## EXPRESS ROUTER

Mediante el uso de Routers de express, se crean los endopint para products y carts. 

1. Ruta de vistas. Se cuenta con la siguientes rutas de vistas:

- Tres rutas GET para renderizar las vista generadas por el motor de plantillas handlebars, hacia el registro de usuarios, login, y logout.

2. Un router de auth para los endpoints para validar el registro de usuarios, login, y logout. En el endpoint de registro de usuario se realiza el registro de la información del usuario emplenado el siguiente modelo hacia la colección users:

```javascript

userName: {
        type: String,
        trim: true,
        required: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    userMail: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    userPassword: {
        type: String,
        trim: true,
    },
    cartId : {
        type: String
    },
    userRoll : {
        type: String,
        required: true,
    }

```

Un endpoint de login, que hace la interacción con la colección de users para buscar al usuario y con la colección sessions, para el almacenamiento de los datos del usuario mediante la persitencia en MongoDB. Si se loguea el administrador se observa el rol de admin; ademas el admin esta hardcodeado en router de auth, por lo que no esta en la base de datos.

Se implementa passport y JWT (JSON Web Token) para realizar la autorización de acceso a la vista de porudctos. Para esto se crea una estrategia de passport para JWT, que validará el token que se almanacena en una cookie llamada jwtCookie, posterior a la validación correcta de la información de contraseña hasheada en la base de datos con la contraseña introducida en formulario de login. Para la creación de la cookie se usa cookie parser.

3. Para el caso de los products en el index.js se crea un middleware para usar el router, archivo **product.router.js** de productos con la ruta **/api/products/**, y crean los siguientes endpoints:

- GET de todos los productos con la ruta **/**, que realiza la busqueda en la base de datos de mongoDB Atlas, y devuelve todos los productos existentes.
- GET de producto por el ID, en la ruta **/:pid**, donde pid es el ID de productos generado por mongoDB Atlas. 
- POST que crea un producto nuevo, en la ruta **/newproduct**, y este a su vez realiza la creación de un nuevo documentos en la base de datos Atlas, enviando un objeto, en el body en JSON, de la forma:

```JSON

{
    "code": String,
    "title": String,
    "description": String,
    "thumbnails": [Arreglo con los links de la imagen o imangenes],
    "price": Number,
    "stock": Number,
    "status": Boolean,
    "category": String
  }

```

- POST que realiza la actualización de un producto, en la ruta **/:pid**, donde pid es el parámetro del ID del producto que se quiere actualizar. El ID del producto, es el id generado por MongoDB Atlas al momento de realizar la creación del documento. SE objeto de forma anterior con la actualización de los datos requeridos.
- DELETE, con la ruta **/:pid** que realiza la eliminación de un producto en la base de datos mongoDB Atlas

4. Para el caso de carts, en el index.js se crea un middleware para usar el router **cart.router.js**, con la ruta **/api/carts**, donde se crean los siguientes endpoints:

- GET con la ruta **/:cid** donde cid es el params que se recibe con el ID de cart que se generó en la base de datos Atlas cuando se creao un cart nuevo, esto para obtener un cart por su ID.
- POST para crear un carrito nuevo, con la ruta **/newcart**, el cart se crea con el arrego de productos vacio, quedando de la forma:

```javascript

{
    products: []
}

```

Cuando se crea el documento en la base datos Atla, se genera un ID del cart automáticamente.

- POST en la ruta **/:cid/product/:pid**, que agregará un producto nuevo que no este en el cart, o actualizar el producto si ya sencuentra en el cart. Los params, cid representa el ID del cart y pid es el ID del producto. Por lo que en el body en JSON se recibira un objeto:

```JSON

{
    "qty": Number
}

```

Donde qty es la cantidad de items del mismo producto. el ID del producto es el que genero en mongoDB Atlas cuando se registro el producto.

Si el pid no exite, se agregará al cart el producto junto con su cantidad en la forma  objeto {_id: pid. qty: qty}; si el producto ya existe solo se modificará la cantidad.

- Se crea un endpoint para agregar o actualizar un producto desde la ruta **/:cid/products**, donde enviar un objeto de la siguiente forma

```JSON

{
    "productId": "id del producto de la base datos products",
    "qty": Number
}

```

- POST para borrar un producto del cart, en la ruta **/:cid/delproduct/:pid**. Mediante este endpint se elimará un producto del documento de cart de la colección carts de Atlas.
- DELETE para borrar un cart de la colección carts, en la ruta **/delcart/:cid**, el endpoint eliminará el documento cart de la colección carts.


## MONGOOSE

Se empleará Mongoose como para el modelado de los datos, para esto primero se realiza conexión a la base da datos en el archivo **db.js** ubicado en la ruta **/dao**.

Se crearan los esquemas para el modelado de los datos de carts, products y messages, elaborando los archivos **modelCart.js, modelProduct.js y modelMessage.js**, respectivamente. 

- El esquema del productos del carts se crea con el siguiente formato de datos, con el nombre de cartProductSchema:

```javascript

{
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
    qty: {
        type: Number
    }
}

```
Esto con la finalidad de implementar populate mediante elmétodo findOne, en el esquema de cart y hacer referencia a los productos con el esquema Products.

asi mismo este esquema se lleva al esquema de carts de la siguiente forma:

```javascript

{
    products: [cartProductSchema]
}

```

- El esquema de productos se define de la siguiente forma:

```javascript

{
    code: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnails: {
        type: Array,
        default: [],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    category: {
        type: String,
        required: true
    }
}

```

Además dentro del esquema de productos se integra la paginación mediante el uso del plugin mongoose aggregate paginate v2.
con aggregate se podran hacer los stages para poder establecer un limite, ordenar por precio, y filtrado por categoria o existencia

El esquema de usuario queda de la siguiente forma:

```javascript

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    userMail: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    userPassword: {
        type: String,
        trim: true,
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    userRoll : {
        type: String,
        required: true,
    }
},
{
    strictPopulate: false
})

userSchema.pre('findOne', function () {
    this.populate('cartId').populate({
        path: 'cartId',
        populate: [
            {path: 'products.productId'}
        ]
    })
})

```

El esquema de mensajes queda de la siguiente forma:

```javascript

const messageTypeSchema = new mongoose.Schema({
    user: {
        type: String
    },
    message: {
        type: String
    }
})
const messageSchema = new mongoose.Schema({
    messages: {
        type: [messageTypeSchema]
    }
})

```

Y finalmente el esquema de tickets:

```javascript

const ticketProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    qty: {
        type: Number
    },
    subtotal: {
        type: Number
    }
})

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    buyedProducts: {
        type: [ticketProductSchema]
    },
    amount: {
        type: Number,
        required: true,
    },
    purchaser: {
        type: String,
        required: true,
    }
},
{
    timestamps: {
        createdAt: 'purchase_datetime',
        updatedAt: false,
    }
})

```

En el esquema de tickets, se utiliza **timestamps** para poder tener la fecha y hora de creación del ticket de compra. De acuerdo la la documentación el horario almacenado es en UTC, y finalmente **node js, realiza el ajuste de la zona horaria de acuerdo a la zona del servidor**. 


## BCRYPT

Se realiza la integración de bcrypt, a fin de realizar un hasheo de la contraseña del usuario, en **/util/bcrypt**, donde se implementan las funciones para realizar la encriptación de la contraseña de usuario, y  para realizar la comparación de la contraseña introducida por el usuario, contra la contraseña registrada en MondoDB, la cual se encuentra encriptada.


## PASSPORT, PASSPORT-GITHUB2 Y PASSPORT-JWT

Se implementa passport y la estrategia de passport-github2, para poder realizar una autenticación de terceros mediante gihub. La estrategia se encuentra en el archivo en **/config/passportGit.config.js**. quedando de la siguiente forma:

```javascript

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "URL del callback"
  }, async (accessToken, refreshToken, profile, done) => {
        //código para identificar la existencia del usuario en MongoDB
        // Si no existe el usuario se crea uno nuevo
        done(null, user)
        //en la posción de user se enviar el usuario encontrado en MongoDB
        //o el usuario creado en MongoDB
  }))

```

Para activar la opción de poder integrar el usuario de github del Ecommerce, es importante realizarlo en la opción de settings del profile del Ecommerce, en la opción de developers, donde cre introducen los datos del URL de la pagina web del Ecommerce,se crea el Client ID y el Client Secret; y se coloca la URL del calback.

**Es importante que tanto en la creación de la aplicación en github, como en la estrategia y en la ruta del router de github, la ruta del callback sea igual en estos 3 lugares**.

A través de la estrategia se realiza la consulta hacia github por los datos de usuario. Para realziar la consulta se usa un router que apunta hacia el endpoint **/github**, donde se implementa passport para realizar la autenticación y usar la estrategia de github, empleando un scope de usuario con el correo electronico, y la sesion en false, ya que session se implementa de forma independiente, para poder hacer la persistencia de sesiones con MongoDB.

Una vez que el usuario realiza el login mediante github, se manda a llamar la ruta de callback, para almacenar en session la información del usuario obtenida por la estrategia de github, y poder hacer la revisión de autenticación mediante el middleware en el router de la vista de productos, una vez que se sabe que el usuario esta autentificado correctamente se redirige hacia la vista de productos.

A través de la estrategia de github, se recolecta la información del usuario de github, y se agrega a la base de datos en caso de que no se encuentre registardo, para esto en el campo de userPassword no se almacena ninguna información. Punto importante a tomar en cuenta, nuevamente, es que **tanto el nombre de usuario como el correo electrónico tengan visibilidad pública a fin de poder recopilar la información**. Mediante la función **done(null, user)** de la estrategia, se recibe en el callback la información del usuario mediante **req.user**.

Para el caso de la estrategia de JWT se crea un archivo en **/config/passportJwt.config.js**, mediante esta estrategia, se implementa un extractor de cookies, de tal forma que se puede comparar el token contenido en la cookie con nombre **jwtCookie**, con el token del usuario generado con JWT. Quedando la estrategia de la siguiente forma:

```javascript

passport.use('jwtAuth', new JWTStartegy({
        jwtFromRequest: JWTExtract.fromExtractors([cookieExtractor]),
        secretOrKey: 'secreto'
    }, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload)
        } catch(err) {
            return done(null, err)
        }
    })

```

y donde la función extractora será de la siguiente forma:

```javascript

const cookieExtractor = (req) => {
    let token = null
    if(req && req.cookies) {
        token = req.cookies['Cookie creada en el login']
    }
    return token
}

```

Mediante el uso del paso del payload de jwt, y mediante el request es posible obtener la información que se encripto mediante JWT; para esto a fin de evitar el uso de infomación sensible, en el token se encripta solo el correo del usuario y el rol.

Entonces, para poder realizar la autorización del uso de un endpoint ya se por parte del usuario o del administrador,  se crea un middleware, que indica si el roll es de usuario o administrador y con esto autorizar el uso del endpoint.

**Por el momento el endpoint del proceso de compra no se esta usando la autorización del usuario, a fin de poder realizar pruebas para el ticket y el arregode IDs de productos sin stock**



Durante el proceso de login, se crea la cookie empleando **cookie-paser** y el token del usuario mediante JWT, meante el usu de un 'secreto', el cual tiene que coincidir con el de que usa en la estrategia de JWT, el cual se incializa en el index.js principal. 

**Para cerrar el proceso al momento de realizar el logout, se destruye la sesion de datos del usuario y la cookie que contine el token de autorización**.

## FAKER

Se crea un mock de productos, el cual puede generar máximo 100 productos. La ruta de acceso al mock, para desarrollo, es **http://localhost:8080/mokingproducts?limit=cantidad_de_productos**. Se usa un query params para saber la cantidad de productos qu se generarán; y en caso de que se coloque cero o una cantidad negativa, se generará la cantidad máxima; de igual forma si no se coloca un límite de prodcutos, se generará la cantidad máxima.

la función que genera los mock de productos se encuentra ubicada en la ruta **/src/utils/mocking**, deonde se encuentra el archivo **product.mock.utils.js**, El servicio, controlador y router para crear los mocks se encuentran en la ruta **/src/mocks/product**

## WINSTON LOGGER

Empleando la dependencia de Winstonjs se agrega un logger a dos archivo llamados **debug.logger.js** e **info.logger.js**, mediante la técnica de factory, se selecciona uno u otro dependiendo de la variable de entorno LOGGER_TYPE, por lo si se selecciona el modo desarrollo, se selecciona el primer archivo de logger y se selecciona producción se selecciona el segundo archivo.

La adición del logger se realiza de la siguiente forma:

```javascript

winston.loggers.add(
    'debugLogger', // Se coloca el nombre del logger
    {
        levels: levelOptions.levels,
        transports: [
            new winston.transports.Console(),
            new winston.transports.File()  // En caso de que se opcupe el envio del log al archivo
        ]
    })

```

Ademas de agregar las opciones de:

levels: para personalizar los niveles para realizar el logging
level: A partir de que nivel vamos a loggear, ya sea por consola o por archivo
combine: Para realizar un formato personalizado combinado
colorize: para asignar colores personalizados a los niveles
timestamp: Para colocar fecha y hora
align: Para alinear la salida del mensaje
printf: para personalizar el formato de salida

ejemplo:

```javascript

level: 'debug',
format: combine(
    colorize({colors: levelOptions.colors}),
    timestamp({
        format: 'DD-MM-YYYY hh:mm:ss A'
    }),
    align(),
    printf(inf => `[${inf.timestamp}] ${inf.level}: ${inf.message}`)
)

```

Para asignar los niveles personalizados y colores personalizados, se crea un archivo **levelOptions.logger.js**, donde se crea un objeto que se exporta, de la siguiente forma:

```javascript

{
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },

    colors: { //Tomar en cuenta que la documentación de winston no se puede asignar el color orange
        fatal: 'red',
        error: 'yellow',
        warning: 'blue',
        info: 'grey',
        http: 'green',
        debug: 'magenta',
    }
}

```

**Nota: Es importante tomar en cuenta que en la documentación de winston logger, al personalizar los colores no se peude asignar el orange como Font Foreground color en alguno de los niveles, en caso de que se asigne este color en algún nivel el server se "romperá" indicando que colors[Colorize.allColors [lookup]] is not a function**

Al final el archivo tipo factory queda como sigue, y seleccionando el archivo de acuerdo al entorno:

```javascript

switch(LOGGER_TYPE) {
    case "DEBUG":
        logger = winston.loggers.get('debugLogger')
    break

    case "INFO":
        logger = winston.loggers.get('infoLogger')
}

```
Este logger se puede exportar e importar hacia algún otro componente dentro de las capas de servidor y poder el logging correcpondiente; pero para el caso de los controllers se crea un middleware que estará haciendo logging de la información en http, el cual se agrega al req  y através de este middleware puede hacer el paso del logger hacia los controllers de los endpoints:

```javascript

const loggerMiddleware = (req, res, next) => {
    req.logger = logger
    req.logger.http(`${req.method} en ${req.url}`)
    next()
}

```

## ENDPOINT DE PRUEBA DE LOGGER

Se realiza la implementación de un endpoint de prueba del logger creado, dado que el logger se configura de acuerdo al entorno; **en el entorno de desarrollo solo se observa los log desde consola desde el nivel debug**, sine embargo en el entorno de producción, **los log se observan en la consola a partir del nivel info**, y **a partir de nivel de error se almacen en un archivo a partir del nivel error**.

El endpoint se encuentra en la dirección **http://localhost:PUERTO/api/loggerTest**.

Lo que realiza el endpoint es la suma de numeros enteros, que llegan a través de los query params, y se espera recibir los parámetros **num1, num2 y num3**, de la forma **http://localhost:PUERTO/api/loggerTest?num1=NUMERO1&num2=NUMERO2&num3=NUMERO3**.

en caso de que falte algún número, dos numeros, o todos, o se coloque cadenas de caracteres arrojaran el mensaje correspndiente. Cuando se envian numeros enteros, se realiza la suma y el endpoint envia el payload con la suma.


## MULTER

A través de multer js se crea una vista para subir archivo llamada **uploads**, tanto el avatar, imagenes de los productos (que puede agregar solo el usuario premium), y los documentos de comprobación para ser usuario premium (ID, comporbante de domicilio y estado de cuenta)

En archivo handlebars de la vista de uploads, se crean los formurarios correspondiente que realizaran el método post hacia el endpoint que tiene el middleware de multer para realizar la subida de archivos.

Actualemente esta mendiente el desarrollo para cargar el avartar y las imagenes de productos, estando ya en funcionamiento el middleware que carga los archivos de comprobación para ser usuario premium. El endpint se encuentra en **/api/users/:cid/documents**

Lo que hara el middleware es crear primero un folder con id de usuario, y posteriormente creará el folder de documents. Una vez creados os folders, se asinará los nombres de los archivo tomando en cuenta el nombre del tag input; de acuerdo a la siguiente **nomenclatura: uid_nombre del input_fecha.extension**. Los nombres de los campos corresponde al tipo del comprobante, Id con nombre idDocument, el de comporbante de domicilio como addressProof, y el estado de cuenta como accountStatement. La extension se obtiene del tipo mime del archivo que se subirá.

Quedando el document storage de multer de la siguiente forma

```javascript

const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let { uid } = req.params
        let mainDir = `${__dirname}/public/customerInfo/${uid}`
        let existMainDir = fs.existsSync(mainDir)
        if(!existMainDir) {
            fs.mkdirSync(mainDir)
        }
        let secondDir = `${__dirname}/public/customerInfo/${uid}/documents`
        let existSecondDir = fs.existsSync(secondDir)
        if(!existSecondDir){
            fs.mkdirSync(secondDir)
        }
        return cb(null, secondDir)
    },
    filename: (req, file, cb) => {
        const { uid } = req.params
        let extArray = file.mimetype.split('/')
        let extension = extArray[1]
        let fileName = `${uid}_${file.fieldname}_${Date.now()}.${extension}`
        cb(null, fileName)
    }
})

```

NOTA: Para suber a usuario premium, es necesario que el usuario estandar haya subido los documentos de comprobación, ya existe um middleware que al momento de cambiar de usuario estandar a premium realiza antes esta comprobación y no se cuenta con la documentación no se podrá realizar el cambio de usuario; el cual apunta hacia el endpoint **/api/users/premium/:uid**




# FIN
 