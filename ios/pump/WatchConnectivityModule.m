#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// On informe Xcode que ce module existe en Swift
@interface RCT_EXTERN_MODULE(WatchConnectivityModule, RCTEventEmitter)

// On expose les méthodes Swift à React Native
RCT_EXTERN_METHOD(sendToWatch:(NSDictionary *)message)
RCT_EXTERN_METHOD(transferToWatch:(NSDictionary *)message)

@end