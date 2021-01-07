import React, { forwardRef } from "react";
import { Text, TextInput } from "react-native";

const CustomText = (props) => {
  return (
    <Text
      {...props}
      style={{
        ...props.style,
        fontFamily: props.style
          ? props.style.fontWeight == "bold"
            ? "SourceSansProB"
            : props.style.fontWeight == "600"
            ? "SourceSansProSB"
            : props.style.fontWeight == "light"
            ? "SourceSansProL"
            : "SourceSansPro"
          : "SourceSansPro",
        color: props.style
          ? props.style.color
            ? props.style.color
            : "#353535"
          : "#353535",
        fontSize: props.style
          ? props.style.fontSize
            ? props.style.fontSize
            : 16
          : 16
      }}
    >
      {props.children}
    </Text>
  );
};

const CustomTextInput = forwardRef((props, ref) => {
  return (
    <TextInput
      ref={ref}
      {...props}
      style={{
        ...props.style,
        fontFamily: props.style
          ? props.style.fontWeight == "bold"
            ? "SourceSansProB"
            : props.style.fontWeight == "600"
            ? "SourceSansProSB"
            : props.style.fontWeight == "light"
            ? "SourceSansProL"
            : "SourceSansPro"
          : "SourceSansPro",
        color: props.style
          ? props.style.color
            ? props.style.color
            : "#353535"
          : "#353535",
        fontSize: props.style
          ? props.style.fontSize
            ? props.style.fontSize
            : 16
          : 16
      }}
    />
  );
});

export { CustomText as Text };
export { CustomTextInput as TextInput };
