# SHOP-FOR-HIM
Shop for him is an e-commerce website which provides all the necessary items for men like clothes , watches,etc. 
We provide largest sets of collections with high qualities and cost effective. Register , Login and Enjoy Shopping. 😊

#### HOME PAGE
![homescreen](screenshots/homescreen.png)

#### LOGIN PAGE
![login](screenshots/login.png)

#### CART PAGE
![cart](screenshots/cart.png)

#### CHECKOUT PAGE
![checkout](screenshots/checkout.png)

#### MYORDERS PAGE
![myorders](screenshots/myorders.png)

## QUICK GUIDE/STEPS TO RUN THE PROJECT:
1. Clone the project .
2. Download and install NodeJS in your environment.
3. Run "npm install" command while inside the ShopForHim folder to install related packages and dependencies.
4. Download and install MongoDB Database [MongoDB Community Server]
5. Add new entry to system environment variable [ PATH ]            [ Ex :  C:\Program Files\MongoDB\Server\5.0\bin ]
6. Run the mongodb daemon [ >> mongod ] 
7. Create directory as below
		C:\data\db\  => Databases will be stored here. [ >> mkdir C:\data\db ]
8. Download and install "Robo 3T" [ MongoDB GUI client ]
9. Now open Robo3T and create new connection and connect.
10. Install nodemon package [ npm install -g nodemon ]


	
### ShopForHim[ Runs on Port 3000 bydefault ]:
Run this project : >> nodemon app.js

-----
### INSTRUCTION FOR ADMIN TO ADD NEW PRODUCTS :
Visit in browser : http://localhost:3000/home/admin [ ADMIN ACESS ] \
USERNAME : ADMIN \
PASSWORD : ADMIN
	
Now, enter below 3 products accordingly : \
[ Demo Image Location is Located at "ShopForHim\public\images\demoproductimages\" ]

##### SHIRT
BRAND : Roadster\
TITLE : Men Navy Printed Cotton Pure Cotton T-shirt\
DESCRIPTION : Navy blue printed T-shirt, has a round neck, short sleeves Manufacturer Info: KB Tex Country of Origin: India\
SIZE : S,M,L,XL\
CATEGORY : Shirt\
PRICE : Rs.2000.00

##### JEANS
BRAND : Wrogn\
TITLE : Men Blue Slim Fit Mid-Rise Clean Look Stretchable Jeans\
DESCRIPTION : Blue medium wash 5-pocket mid-rise jeans, clean look with light fade, has a button and zip closure, waistband with belt loops\
SIZE : 30,32,34,36,38,40\
CATEGORY : Jeans\
PRICE : Rs.1690.00

##### WATCHES
BRAND : Daniel Klein\
TITLE : Premium Men Coffee Brown Analogue Watch DK11599-4\
DESCRIPTION : Display: Analogue Movement: Quartz Power source: Battery Dial style: Solid round stainless steel dial Features: Reset Time, Reset Time, Glow in the Dark Inlays Strap style: Brown regular, leather strap with a tang closure Water resistance: 50 m Warranty: 2 years Warranty provided by brand/manufacturer Manufactured by: Daniel Klein group Country of Origin: Hong Kong\
SIZE : Small,Medium,Large,OneSize\
CATEGORY : Watches\
PRICE : Rs.2199.00

-----
### FOR NORMAL USERS:
Visit in browser : http://localhost:3000 \
Register and Login.\
And Start Shopping😊

