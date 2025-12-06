if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/mugod/.gradle/caches/8.12/transforms/12cbac3cf82369a2008c243d5ed52892/transformed/jetified-hermes-android-0.76.6-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/mugod/.gradle/caches/8.12/transforms/12cbac3cf82369a2008c243d5ed52892/transformed/jetified-hermes-android-0.76.6-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

