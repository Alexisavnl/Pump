#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WorkoutSessionModule, NSObject)

RCT_EXTERN_METHOD(start:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) // Utilise 'rejecter' ici

RCT_EXTERN_METHOD(stop)

@end