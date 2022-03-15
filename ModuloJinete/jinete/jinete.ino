#include <esp_now.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

#include <SPI.h>
#include <TFT_eSPI.h> // Hardware-specific library
#include <Button2.h>

#include "PubSubClient.h" // Connect and publish to the MQTT broker

//////////////////////////
//////    COM 8     //////
//////////////////////////

/////////////////////////////////////////////////////////////////

#define BUTTON_A_PIN 0
#define BUTTON_B_PIN 35

const int BOARD_ID_1 = 1;
const int BOARD_ID_2 = 2;
const int BOARD_ID_3 = 3;
const int BOARD_ID_4 = 4;

const int SENTDELAY = 30;

// const char *ssid = "EscaladaZ";
// const char *password = "romualdo44";

// const char *ssid = "Antel46d6d-2.4GHz";
// const char *password = "hubtta6t";

// const char *ssid = "Pruebas";
// const char *password = "Matero123!";

// const char *ssid = "juan93";
// const char *password = "matero123";

const char *ssid = "dressagement";
const char *password = "dressage";

String serverName = "http://192.168.10.150:5000/api/";
String serverPath = "";

// MQTT
const char *mqtt_server = "192.168.10.151"; // IP of the MQTT broker
const char *dressage_topic = "dressage";
const char *mqtt_username = "pi";    // MQTT username
const char *mqtt_password = "tesis"; // MQTT password
const char *clientID = "jinete2";    // MQTT client ID

// MAC Address of the receiver
// uint8_t broadcastAddress4[] = {0x7C, 0x9E, 0xBD, 0xE4, 0x9F, 0xB4};
//  Pata 5 - ESP Board MAC Address:  7C:9E:BD:E4:9F:B4

// MAC Address of the receiver
uint8_t broadcastAddress1[] = {0x24, 0x0A, 0xC4, 0xEF, 0x8D, 0xF0};
// Pata 1 - Patas soldadas - ESP Board MAC Address: 24:0A:C4:EF:8D:F0

// MAC Address of the receiver
uint8_t broadcastAddress2[] = {0x24, 0x62, 0xAB, 0xFD, 0x0E, 0x7C};
// Pata 2 ESP Board MAC Address:  24:62:AB:FD:0E:7C

// MAC Address of the receiver
uint8_t broadcastAddress3[] = {0x3C, 0x61, 0x05, 0x32, 0x2D, 0x0C};
// Pata 3 - ESP Board MAC Address:  3C:61:05:32:2D:0C

// MAC Address of the receiver
uint8_t broadcastAddress4[] = {0x3C, 0x61, 0x05, 0x17, 0x1F, 0xC8};
// Pata 4 - ESP Board MAC Address:  3C:61:05:17:1F:C8

esp_now_peer_info_t peerInfo1;
esp_now_peer_info_t peerInfo2;
esp_now_peer_info_t peerInfo3;
esp_now_peer_info_t peerInfo4;

typedef struct struct_message
{
    int id;
    float ax;
    float ay;
    float az;
    float gx;
    float gy;
    float gz;
    float mx;
    float my;
    float mz;
    int tiempo;
} struct_message;

typedef struct struct_order
{
    int id;    // id de la placa que recibe
    int order; // tipo  de accion

} struct_order;

HTTPClient http;
int httpResponseCode;

/////////////////////////////////////////////////////////////////

struct_message incomingReadings;
struct_order myData1;
struct_order myData2;
struct_order myData3;
struct_order myData4;

JSONVar board;
String jsonString;

TFT_eSPI tft = TFT_eSPI();

Button2 buttonA = Button2(BUTTON_A_PIN);
Button2 buttonB = Button2(BUTTON_B_PIN);

int opcion = 1;
int submenu = 1;
boolean entrenar = false;
boolean recibido = false;
int prueba = 0;
int tiempoPost = 0;
int id_entrenamiento;
int lastBoardID = BOARD_ID_4;
int espera_conexion = 0;

// Variables para control de envíos (porocolo comunicacion master-slave)
int demora;
int momentoEnvio;
/////////////////////////////////////////////////////////////////

WiFiClient wifiClient;
PubSubClient client(mqtt_server, 1883, wifiClient);

// callback function that will be executed when data is received
void OnDataRecv(const uint8_t *mac_addr, const uint8_t *incomingData, int len)
{
    // Copies the sender mac address to a string
    char macStr[18];
    // Serial.print("Packet received from: ");
    // snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
    //          mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
    // Serial.println(macStr);
    memcpy(&incomingReadings, incomingData, sizeof(incomingReadings));

    board["tiempo"] = incomingReadings.tiempo;
    board["id"] = incomingReadings.id;
    board["entrenamiento_id"] = id_entrenamiento;
    board["ax"] = incomingReadings.ax;
    board["ay"] = incomingReadings.ay;
    board["az"] = incomingReadings.az;
    board["gx"] = incomingReadings.gx;
    board["gy"] = incomingReadings.gy;
    board["gz"] = incomingReadings.gz;
    board["mx"] = incomingReadings.mx;
    board["my"] = incomingReadings.my;
    board["mz"] = incomingReadings.mz;

    if (incomingReadings.id == BOARD_ID_1 && lastBoardID == BOARD_ID_4)
    {
        lastBoardID = incomingReadings.id;
        jsonString += JSON.stringify(board);
        // Serial.println("recived from board 1");
        recibido = true;
    }
    else if (incomingReadings.id == BOARD_ID_2 && lastBoardID == BOARD_ID_1)
    {
        lastBoardID = incomingReadings.id;
        jsonString += JSON.stringify(board);
        // Serial.println("recived from board 2");
        recibido = true;
    }
    else if (incomingReadings.id == BOARD_ID_3 && lastBoardID == BOARD_ID_2)
    {
        lastBoardID = incomingReadings.id;
        jsonString += JSON.stringify(board);
        // Serial.println("recived from board 3");
        recibido = true;
    }
    else if (incomingReadings.id == BOARD_ID_4 && lastBoardID == BOARD_ID_3)
    {
        lastBoardID = incomingReadings.id;
        jsonString += JSON.stringify(board);
        // Serial.println("recived from board 4");
        recibido = true;
    }

    // Serial.println(jsonString);

    // Serial.printf("Board ID %d: bytes\n", incomingReadings.id);
    // Serial.printf("ax value: %4.2f \n", incomingReadings.ax);
    // Serial.printf("ay value: %4.2f \n", incomingReadings.ay);
    // Serial.printf("az value: %4.2f \n", incomingReadings.az);
    // Serial.printf("tiempo value: %d \n", incomingReadings.tiempo);
    // Serial.println();
    // Serial.println(prueba);
}

/////////////////////////////////////////////////////////////////

// callback when data is sent
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status)
{
    // Serial.print("\r\nLast Packet Send Status:\t");
    // Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

/////////////////////////////////////////////////////////////////

void setup()
{
    // entrenar = false;
    tft.init();

    tft.fillScreen(TFT_BLACK);

    // Set "cursor" at top left corner of display (0,0) and select font 4
    tft.setCursor(0, 0);
    tft.setRotation(0);

    // Set the font colour to be white with a black background
    tft.setTextColor(TFT_RED);
    tft.setTextFont(1);
    tft.setTextSize(2);

    // Menu and button initiate
    buttonA.setClickHandler(click);
    buttonB.setClickHandler(click);

    // Initialize Serial Monitor
    Serial.begin(115200);

    // Set the device as a Station and Soft Access Point simultaneously
    WiFi.mode(WIFI_AP_STA);

    // Set device as a Wi-Fi Station
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        if (espera_conexion > 15)
        {
            esp_deep_sleep_start();
        }
        espera_conexion = espera_conexion + 1;

        Serial.println("Setting as a Wi-Fi Station..");
        tft.fillScreen(TFT_BLACK);
        tft.setCursor(0, 0);

        tft.println("Setting as a Wi-Fi Station..\n");
    }

    Serial.print("Station IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Wi-Fi Channel: ");
    Serial.println(WiFi.channel());

    tft.fillScreen(TFT_BLACK);
    tft.setCursor(0, 0);
    tft.println("Station IP Address: ");
    tft.println(WiFi.localIP());
    tft.print("Wi-Fi Channel: ");
    tft.println(WiFi.channel());

    // Init ESP-NOW
    if (esp_now_init() != ESP_OK)
    {
        Serial.println("Error initializing ESP-NOW");
        return;
    }

    // Once ESPNow is successfully Init, we will register for Send CB to
    // get the status of Trasnmitted packet
    esp_now_register_send_cb(OnDataSent);

    // Once ESPNow is successfully Init, we will register for recv CB to
    // get recv packer info
    esp_now_register_recv_cb(OnDataRecv);

    // Register peer
    memcpy(peerInfo1.peer_addr, broadcastAddress1, 6);
    peerInfo1.encrypt = false;

    // Add peer
    if (esp_now_add_peer(&peerInfo1) != ESP_OK)
    {
        Serial.println("Failed to add peer 1");
        return;
    }

    // Register peer
    memcpy(peerInfo2.peer_addr, broadcastAddress2, 6);
    peerInfo2.encrypt = false;

    // Add peer
    if (esp_now_add_peer(&peerInfo2) != ESP_OK)
    {
        Serial.println("Failed to add peer 2");
        return;
    }

    // Register peer
    memcpy(peerInfo3.peer_addr, broadcastAddress3, 6);
    peerInfo3.encrypt = false;

    // Add peer
    if (esp_now_add_peer(&peerInfo3) != ESP_OK)
    {
        Serial.println("Failed to add peer 3");
        return;
    }

    // Register peer
    memcpy(peerInfo4.peer_addr, broadcastAddress4, 6);
    peerInfo4.encrypt = false;

    // Add peer
    if (esp_now_add_peer(&peerInfo4) != ESP_OK)
    {
        Serial.println("Failed to add peer 4");
        return;
    }

    // delay para poder ver la ip antes del despliegue del menu
    delay(3000);
    menuPrinc(1);
}

/////////////////////////////////////////////////////////////////

void loop()
{
    buttonA.loop();
    buttonB.loop();

    /*
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST("{\"entrenamiento_id\":\"1\"}");

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.print("Millis: ");
    Serial.println(millis());
    http.end();
    */

    while (entrenar)
    {
        buttonB.loop();
        myData1.id = BOARD_ID_1;
        myData1.order = 5;
        myData2.id = BOARD_ID_2;
        myData2.order = 5;
        myData3.id = BOARD_ID_3;
        myData3.order = 5;
        myData4.id = BOARD_ID_4;
        myData4.order = 5;

        // Send message via ESP-NOW

        esp_err_t result = esp_now_send(broadcastAddress1, (uint8_t *)&myData1, sizeof(myData1));
        if (result == ESP_OK)
        {
            recibido = false;
            momentoEnvio = millis();
            demora = 0;
        }
        else // Error sending the data Pata 1
        {
            recibido = true;
            lastBoardID = 1;
        }

        while (!recibido && demora < SENTDELAY) // se espera un tiempo prudencial a recibir el dato antes de continuar con la siguiente board
        {
            demora = millis() - momentoEnvio; // se calcula el tiempo de demora en respuesta
        }

        if (!recibido) // ajuste de lastBoardID aunque no se haya recibido la respuesta. (se asume dato perdido)
        {
            if (lastBoardID == 4)
            {
                lastBoardID = 1;
            }
            else
            {
                lastBoardID += 1;
            }
        }
        else
        {
            jsonString += ",";
        }

        // Serial.print("Millis: ");
        // Serial.println(millis());

        // Comunicacion con la Appi
        // http.begin(serverName);
        // http.addHeader("Content-Type", "application/json");
        // httpResponseCode = http.POST(jsonString);

        // Serial.print("HTTP Response code: ");
        // Serial.println(httpResponseCode);
        // Serial.print("Millis: ");
        // Serial.println(millis());
        // http.end();

        result = esp_now_send(broadcastAddress2, (uint8_t *)&myData2, sizeof(myData2));
        if (result == ESP_OK)
        {
            recibido = false;
            momentoEnvio = millis();
            demora = 0;
        }
        else // Error sending the data Pata 2
        {
            recibido = true;
            lastBoardID = 2;
        }

        while (!recibido && demora < SENTDELAY) // se espera un tiempo prudencial a recibir el dato antes de continuar con la siguiente board
        {
            demora = millis() - momentoEnvio; // se calcula el tiempo de demora en respuesta
        }

        if (!recibido) // ajuste de lastBoardID aunque no se haya recibido la respuesta. (se asume dato perdido)
        {
            if (lastBoardID == 4)
            {
                lastBoardID = 1;
            }
            else
            {
                lastBoardID += 1;
            }
        }
        else
        {
            jsonString += ",";
        }

        result = esp_now_send(broadcastAddress3, (uint8_t *)&myData3, sizeof(myData3));
        if (result == ESP_OK)
        {
            recibido = false;
            momentoEnvio = millis();
            demora = 0;
        }
        else // Error sending the data Pata 3
        {
            recibido = true;
            lastBoardID = 3;
        }

        while (!recibido && demora < SENTDELAY) // se espera un tiempo prudencial a recibir el dato antes de continuar con la siguiente board
        {
            demora = millis() - momentoEnvio; // se calcula el tiempo de demora en respuesta
        }
        // Serial.print(demora);
        if (!recibido) // ajuste de lastBoardID aunque no se haya recibido la respuesta. (se asume dato perdido)
        {
            if (lastBoardID == 4)
            {
                lastBoardID = 1;
            }
            else
            {
                lastBoardID += 1;
            }
        }
        else
        {
            jsonString += ",";
        }

        result = esp_now_send(broadcastAddress4, (uint8_t *)&myData4, sizeof(myData4));
        if (result == ESP_OK)
        {
            recibido = false;
            momentoEnvio = millis();
            demora = 0;
        }
        else // Error sending the data Pata 4
        {
            recibido = true;
            lastBoardID = 4;
        }

        while (!recibido && demora < SENTDELAY) // se espera un tiempo prudencial a recibir el dato antes de continuar con la siguiente board
        {
            demora = millis() - momentoEnvio; // se calcula el tiempo de demora en respuesta
        }

        if (!recibido) // ajuste de lastBoardID aunque no se haya recibido la respuesta. (se asume dato perdido)
        {
            if (lastBoardID == 4)
            {
                lastBoardID = 1;
            }
            else
            {
                lastBoardID += 1;
            }
        }

        buttonB.loop();

        if ((millis() - tiempoPost) > 1000) // cuando se llega 1 segundo de datos se envían al servidor
        {
            jsonString += "]";
            Serial.print("Millis: ");
            Serial.println(millis());

            //  Comunicacion con la API de backend
            serverPath = serverName + "medida/new";
            http.begin(serverPath);
            http.addHeader("Content-Type", "application/json");
            httpResponseCode = http.POST(jsonString);
            // Serial.printf("largo string: %d \n", jsonString.length());
            Serial.print("Millis: ");
            Serial.println(millis());
            // Serial.print("HTTP Response code: ");
            // Serial.println(httpResponseCode);

            jsonString = "["; // limpiando paquete
            http.end();
            tiempoPost = millis();
        }
        else if (recibido)
        {
            jsonString += ",";
        }

        buttonB.loop();
    }
}

void menuPrinc(int seleccion)
{
    // Cabecera
    tft.setRotation(0);
    tft.fillScreen(TFT_BLACK);
    tft.setCursor(16, 0);
    tft.setTextColor(TFT_BLUE);
    tft.setTextSize(1);
    tft.println("DRESSAGEMENT");
    tft.drawLine(0, 10, 128, 10, TFT_BLUE);
    // Rectangulo y su posición
    int posicion[4] = {0, 18, 43, 68};
    tft.fillRect(10, posicion[seleccion], 110, 25, TFT_BLUE);
    // Opciones del menu
    tft.setTextColor(TFT_WHITE);
    tft.setCursor(16, 25);
    tft.println("Calibrar");
    tft.setCursor(16, 50);
    tft.println("Entrenamiento");
    tft.setCursor(16, 75);
    tft.println("Apagar");
}

void menuEntr(int seleccion)
{
    // Cabecera
    tft.fillScreen(TFT_BLACK);
    tft.setCursor(16, 0);
    tft.setTextColor(TFT_BLUE);
    tft.setTextSize(1);
    tft.println("ENTRENAMIENTO");
    tft.drawLine(0, 10, 128, 10, TFT_BLUE);
    // Rectangulo y su posición
    int posicion[5] = {0, 18, 43, 68, 93};
    tft.fillRect(10, posicion[seleccion], 110, 25, TFT_BLUE);
    // Opciones del menu
    tft.setTextColor(TFT_WHITE);
    tft.setCursor(16, 25);
    tft.println("Iniciar");
    tft.setCursor(16, 50);
    tft.println("Detener");
    tft.setCursor(16, 75);
    tft.println("Atras");
    // tft.setCursor(16, 100);
    // tft.println("Pedir");
}

void menuEntrenando(int seleccion)
{
    // Cabecera
    tft.fillScreen(TFT_BLACK);
    tft.setCursor(16, 0);
    tft.setTextColor(TFT_BLUE);
    tft.setTextSize(1);
    tft.println("ENTRENANDO");
    tft.drawLine(0, 10, 128, 10, TFT_BLUE);
    // Rectangulo y su posición
    int posicion[5] = {0, 18, 43, 68, 93};
    tft.fillRect(10, posicion[seleccion], 110, 25, TFT_BLUE);
    // Opciones del menu
    tft.setTextColor(TFT_WHITE);
    tft.setCursor(16, 25);
    tft.println("Detener");
    // tft.setCursor(16, 50);
    // tft.println("Pedir");
}

/////////////////////////////////////////////////////////////////

void click(Button2 &btn)
{
    if (btn == buttonA)
    {
        Serial.println("A");
        opcion++;
        if (submenu == 1)
        {
            if (opcion == 4)
                opcion = 1;
            menuPrinc(opcion);
        }
        else if (submenu == 2)
        {
            if (opcion == 4)
                opcion = 1;
            menuEntr(opcion);
        }
    }

    if (btn == buttonB)
    {
        Serial.println("B");
        if (submenu == 1)
        {
            if (opcion == 2)
            {
                submenu = 2;
                opcion = 1;
                menuEntr(opcion);
            }
            else if (opcion == 3)
            {
                esp_deep_sleep_start();
            }
        }
        else if (submenu == 2)
        {
            if (opcion == 1)
            {
                lastBoardID = BOARD_ID_4;
                entrenar = true;

                // comenzamos entrenamiento y pedimos el numero de entrenamiento
                serverPath = serverName + "entrenamiento/new";
                Serial.print("Enviando ...... ");
                Serial.println(serverPath);
                http.begin(serverPath);
                int algo = http.GET();
                Serial.println(algo);
                id_entrenamiento = http.getString().toInt();
                Serial.println(id_entrenamiento);

                // Conectamos a la raspberry para comenzar grabación
                connect_MQTT();
                // PUBLISH to the MQTT Broker (topic = Temperature, defined at the beginning)
                if (client.publish(dressage_topic, String(id_entrenamiento).c_str()))
                {
                    Serial.println("id_entrenamiento sent!");
                }
                client.disconnect(); // disconnect from the MQTT broker

                // Iniciamos a recabar datos de patas
                myData1.id = BOARD_ID_1;
                myData1.order = 1;
                myData2.id = BOARD_ID_2;
                myData2.order = 1;
                myData3.id = BOARD_ID_3;
                myData3.order = 1;
                myData4.id = BOARD_ID_4;
                myData4.order = 1;
                // Send message via ESP-NOW
                esp_err_t result = esp_now_send(broadcastAddress1, (uint8_t *)&myData1, sizeof(myData1));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 1");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 1");
                }

                result = esp_now_send(broadcastAddress2, (uint8_t *)&myData2, sizeof(myData2));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 2");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 2");
                }

                result = esp_now_send(broadcastAddress3, (uint8_t *)&myData3, sizeof(myData3));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 4");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 4");
                }

                result = esp_now_send(broadcastAddress4, (uint8_t *)&myData4, sizeof(myData4));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 6");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 6");
                }
                // iniciamos entrenamiento y iniciamos el server http
                // http.begin(serverName);
                // http.addHeader("Content-Type", "application/json");
                // httpResponseCode = http.POST("newtraining");
                tiempoPost = millis();
                submenu = 3;
                opcion = 1;
                menuEntrenando(opcion);
            }
            else if (opcion == 2)
            {
                entrenar = false;

                // Conectamos a la raspberry para detener grabación
                connect_MQTT();
                // PUBLISH to the MQTT Broker (topic = Temperature, defined at the beginning)
                if (client.publish(dressage_topic, String(0).c_str()))
                {
                    Serial.println("id_entrenamiento sent!");
                }
                client.disconnect(); // disconnect from the MQTT broker

                myData1.id = BOARD_ID_1;
                myData1.order = 9;
                myData2.id = BOARD_ID_2;
                myData2.order = 9;
                myData3.id = BOARD_ID_3;
                myData3.order = 9;
                myData4.id = BOARD_ID_4;
                myData4.order = 9;
                // Send message via ESP-NOW
                esp_err_t result = esp_now_send(broadcastAddress1, (uint8_t *)&myData1, sizeof(myData1));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 1");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 1");
                }

                result = esp_now_send(broadcastAddress2, (uint8_t *)&myData2, sizeof(myData2));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 2");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 2");
                }

                result = esp_now_send(broadcastAddress3, (uint8_t *)&myData3, sizeof(myData3));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 4");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 4");
                }

                result = esp_now_send(broadcastAddress4, (uint8_t *)&myData4, sizeof(myData4));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 6");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 6");
                }
                // http.end(); // Al poner detener cortamos el http server
                submenu = 2;
                opcion = 1;
                menuEntr(opcion);
            }
            else if (opcion == 3)
            {
                submenu = 1;
                opcion = 1;
                menuPrinc(opcion);
            }
        }
        else if (submenu == 3)
        {
            if (opcion == 1)
            {
                entrenar = false;

                // Conectamos a la raspberry para detener grabación
                connect_MQTT();
                // PUBLISH to the MQTT Broker (topic = Temperature, defined at the beginning)
                if (client.publish(dressage_topic, String(0).c_str()))
                {
                    Serial.println("id_entrenamiento sent!");
                }
                client.disconnect(); // disconnect from the MQTT broker

                myData1.id = BOARD_ID_1;
                myData1.order = 9;
                myData2.id = BOARD_ID_2;
                myData2.order = 9;
                myData3.id = BOARD_ID_3;
                myData3.order = 9;
                myData4.id = BOARD_ID_4;
                myData4.order = 9;
                // Send message via ESP-NOW
                esp_err_t result = esp_now_send(broadcastAddress1, (uint8_t *)&myData1, sizeof(myData1));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 1");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 1");
                }

                result = esp_now_send(broadcastAddress2, (uint8_t *)&myData2, sizeof(myData2));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 2");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 2");
                }

                result = esp_now_send(broadcastAddress3, (uint8_t *)&myData3, sizeof(myData3));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 4");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 4");
                }

                result = esp_now_send(broadcastAddress4, (uint8_t *)&myData4, sizeof(myData4));
                if (result == ESP_OK)
                {
                    Serial.println("Sent with success to Pata 6");
                }
                else
                {
                    Serial.println("Error sending the data to Pata 6");
                }
                // http.end(); // Al poner detener cortamos el http server
                submenu = 2;
                opcion = 1;
                menuEntr(opcion);
            }
        }
    }
    delay(200);
}

void connect_MQTT()
{
    // Connect to MQTT Broker
    // client.connect returns a boolean value to let us know if the connection was successful.
    // If the connection is failing, make sure you are using the correct MQTT Username and Password (Setup Earlier in the Instructable)
    if (client.connect(clientID, mqtt_username, mqtt_password))
    {
        Serial.println("Connected to MQTT Broker!");
    }
    else
    {
        Serial.println("Connection to MQTT Broker failed...");
    }
}
