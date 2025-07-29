

```
📦 WendiGame_v2  
├── .gradle  
├── .idea  
├── build  
├── gradle  
├── node_modules  
├── src  
│   ├── main  
│   │   ├── java  
│   │   │   └── com.devscast.wendigame  
│   │   │       ├── config  
│   │   │       │   ├── JoueurService.java  
│   │   │       │   └── WebSocketService.java  
│   │   │       ├── controller  
│   │   │       │   ├── ChatController.java  
│   │   │       │   ├── JoueurController.java  
│   │   │       │   ├── LobbyController.java  
│   │   │       │   └── LoginController.java  
│   │   │       ├── dto  
│   │   │       │   └── CommandeDTO  
│   │   │       ├── model  
│   │   │       │   ├── ChatMessage.java  
│   │   │       │   ├── Joueur.java  
│   │   │       │   ├── LobbyMessage.java  
│   │   │       │   └── PartieStatus.java  
│   │   │       └── WendiGameApplication.java  
│   │   ├── resources  
│   │   │   ├── static  
│   │   │   │   ├── js  
│   │   │   │   │   ├── lobby.js  
│   │   │   │   │   └── main.js  
│   │   │   │   └── index.html  
│   │   │   ├── templates  
│   │   │   └── application.properties  
│   └── test  
│       └── java  
│           └── com.devscast.wendigame  
│               └── WendiGameApplicationTests.java  
├── wendigame-frontend  
│   ├── build  
│   │   └── static  
│   │       ├── asset-manifest.json  
│   │       ├── favicon.ico  
│   │       ├── index.html  
│   │       ├── logo192.png  
│   │       ├── logo512.png  
│   │       ├── manifest.json  
│   │       └── robots.txt  
│   ├── node_modules  
│   ├── public  
│   │   ├── favicon.ico  
│   │   ├── index.html  
│   │   ├── logo192.png  
│   │   ├── logo512.png  
│   │   ├── manifest.json  
│   │   └── robots.txt  
│   ├── src  
│   │   ├── assets  
│   │   │   ├── css  
│   │   │   │   ├── main.css  
│   │   │   │   └── style.css  
│   │   │   └── img  
│   │   │       ├── img1.jpg  
│   │   │       └── img2.jpg  
│   │   ├── components  
│   │   │   ├── CreateProfilPage.jsx  
│   │   │   ├── GameHomePage.jsx  
│   │   │   ├── LobbyPage.jsx  
│   │   │   └── LoginPage.jsx  
│   │   ├── websocket  
│   │   │   └── socket.js  
│   │   ├── App.jsx  
│   │   └── index.js  
│   ├── .gitignore  
│   ├── package.json  
│   ├── package-lock.json  
│   └── README.md  
├── .gitattributes  
├── .gitignore  
├── build.gradle  
├── gradlew  
├── gradlew.bat  
├── HELP.md  
├── joueurs.json  
├── package.json  
├── package-lock.json  
└── settings.gradle  
```


build frontend React (`wendigame-frontend/build`) :
```
npm run build
```

debarrer backend
```
./gradlew bootRun
```
