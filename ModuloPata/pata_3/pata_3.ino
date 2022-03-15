// PLACA 1 - PATAS SOLDADAS
#include <esp_now.h>
#include <esp_wifi.h>
#include <WiFi.h>
//#include "MPU9250.h"
// SE MODIFICÓ LA LIBRERÍA PARA QUE FUNCIONÉ A 16G -
// LÍNEA 23 - Se modificó el hexadecimal para coincidir con el número binario 11000 - AFS_SEL =3 - writeMPU6050(MPU6050_ACCEL_CONFIG, 0x18);
// LÍNEA 127, 128 Y 129 - Se modificó valor de LSB SENSITIVITY a 2048 para coincidir con 16g
#include <MPU6050_tockn.h>

//////////////////////////
//////    COM 7     //////
//////////////////////////

// Set your Board ID (ESP32 Sender #1 = BOARD_ID 1, ESP32 Sender #2 = BOARD_ID 2, etc)
#define BOARD_ID 3

// MAC Address of the receiver
uint8_t broadcastAddress[] = {0x84, 0xCC, 0xA8, 0x60, 0x0A, 0xC0};
// an MPU9250 object with the MPU-9250 sensor on I2C bus 0 with address 0x68 // 84:CC:A8:60:0A:C0
// MPU9250 IMU(Wire, 0x68);
MPU6050 mpu6050(Wire, 0.16, 0.98);

// Structure example to send data
// Must match the receiver structure
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

// Create a struct_message called myData
struct_message myData;
struct_order incomingReadings;

// Variables Globales

int order;
int status;
int entrenamiento_milis;

unsigned long previousMillis = 0;
const long interval = 26; // Interval at which to publish sensor readings

// Insert your SSID
// constexpr char WIFI_SSID[] = "ESP_0D06AA1";
// constexpr char WIFI_SSID[] = "EscaladaZ";
// constexpr char WIFI_SSID[] = "Antel46d6d-2.4GHz";
// constexpr char WIFI_SSID[] = "Pruebas";
constexpr char WIFI_SSID[] = "dressagement";
// constexpr char WIFI_SSID[] = "juan93";

int32_t getWiFiChannel(const char *ssid)
{
  if (int32_t n = WiFi.scanNetworks())
  {
    for (uint8_t i = 0; i < n; i++)
    {
      if (!strcmp(ssid, WiFi.SSID(i).c_str()))
      {
        return WiFi.channel(i);
      }
    }
  }
  return 0;
}

// callback when data is sent
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status)
{
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

// callback function that will be executed when data is received
void OnDataRecv(const uint8_t *mac_addr, const uint8_t *incomingData, int len)
{
  // Copies the sender mac address to a string
  char macStr[18];
  Serial.print("Order received from: ");
  snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
  Serial.println(macStr);
  memcpy(&incomingReadings, incomingData, sizeof(incomingReadings));

  if (BOARD_ID == incomingReadings.id)
  {
    order = incomingReadings.order;
    if (order == 1)
    {
      entrenamiento_milis = millis();
    }
  }
  Serial.printf("Board ID: %d \n", BOARD_ID);
  Serial.printf("Board ID rec: %d \n", incomingReadings.id);
  Serial.printf("order value: %d \n", incomingReadings.order);
  Serial.println();
}

void setup()
{

  // Accion inicial
  order = 0;

  // Init Serial Monitor
  Serial.begin(115200);

  // status = IMU.begin();
  Wire.begin();
  mpu6050.begin();
  mpu6050.calcGyroOffsets(true); /*if (status < 0)
 {
   Serial.println("IMU initialization unsuccessful");
   Serial.println("Check IMU wiring or try cycling power");
   Serial.print("Status: ");
   //Serial.println(status);
   while (1)
   {
   }
 }*/

  // WiFi.disconnect();

  // Set device as a Wi-Fi Station and set channel
  WiFi.mode(WIFI_STA);

  int32_t channel = getWiFiChannel(WIFI_SSID);

  WiFi.printDiag(Serial); // Uncomment to verify channel number before
  esp_wifi_set_promiscuous(true);
  esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);
  esp_wifi_set_promiscuous(false);
  WiFi.printDiag(Serial); // Uncomment to verify channel change after

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
  esp_now_peer_info_t peerInfo;
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.encrypt = false;

  // Add peer
  if (esp_now_add_peer(&peerInfo) != ESP_OK)
  {
    Serial.println("Failed to add peer");
    return;
  }
}

void loop()
{

  // if action == 0 --> no hago nada no arrancamos
  // if action == 1 --> comenzar entranamiento ( y leer IMU)
  // if action == 5 --> enviar datos
  // if action == 9 --> detener entrenamiento

  if (order == 1)
  {

    /*IMU.readSensor();

    // leemos IMU y guardamos en un Buffer
    myData.id = BOARD_ID;
    myData.ax = IMU.getAccelX_mss();
    myData.ay = IMU.getAccelY_mss();
    myData.az = IMU.getAccelZ_mss();
    myData.gx = IMU.getGyroX_rads();
    myData.gy = IMU.getGyroY_rads();
    myData.gz = IMU.getGyroZ_rads();
    myData.gx = IMU.getMagX_uT();
    myData.my = IMU.getMagY_uT();
    myData.mz = IMU.getMagZ_uT();

    //Serial.println(IMU.getAccelX_mss());

    myData.tiempo = millis() - entrenamiento_milis;*/

    mpu6050.update();

    // Now we'll calculate the accleration value into actual g's
    myData.ax = mpu6050.getAccX(); // get actual g value, this depends on scale being set
    myData.ay = mpu6050.getAccY();
    myData.az = mpu6050.getAccZ();

    // Calculate the gyro value into actual degrees per second
    myData.gx = mpu6050.getGyroX(); // get actual gyro value, this depends on scale being set
    myData.gy = mpu6050.getGyroY();
    myData.gz = mpu6050.getGyroZ();

    myData.id = BOARD_ID;
    // myData.ax = random(1, 8);
    // myData.ay = 200;
    // myData.az = 300;
    // myData.gx = 1000;
    // myData.gy = 2000;
    // myData.gz = 3000;
    myData.mx = 0;
    myData.my = 0;
    myData.mz = 0;
    myData.tiempo = millis() - entrenamiento_milis;
  }

  if (order == 5)
  {
    // Send message via ESP-NOW
    Serial.println("Enviando");
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *)&myData, sizeof(myData));
    if (result == ESP_OK)
    {
      Serial.println("Sent with success");
    }
    else
    {
      Serial.println("Error sending the data");
    }

    // delay(20);
    order = 1; // para que deje de mandar y vuelva a recolectar datos
  }

  if (order == 9)
  {

    order = 0;
  }
}
