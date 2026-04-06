#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

RCT_EXTERN_MODULE(WatchConnectivityModule, RCTEventEmitter)

RCT_EXTERN_METHOD(sendToWatch:(NSDictionary *)message)
RCT_EXTERN_METHOD(transferToWatch:(NSDictionary *)message)
