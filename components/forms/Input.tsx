import {
  Control,
  FieldValues,
  UseControllerProps,
  useController,
} from "react-hook-form";
import { View } from "react-native";
import { HelperText, Text, TextInput } from "react-native-paper";

type Props<T extends FieldValues> = {
  label?: string;
  placeholder?: string;
  type?: string;
  showlabel?: boolean;
  className?: string;
  required?: boolean;
  control: Control<T>;
  defaultValue?: T;
} & UseControllerProps<T>;

const FormField = <T extends FieldValues>(props: Props<T>) => {
  const { fieldState, field } = useController({
    ...props,
  });

  return (
    <View className="w-full mt-2">
      {props?.showlabel && (
        <View className="mt-4">
          <Text>{props.label}</Text>
          {props.required && <Text className="text-red-600">*</Text>}
        </View>
      )}
      <TextInput
        mode="flat"
        {...props}
        {...field}
        placeholder={props.placeholder}
        className={`${props.className}`}
        onChange={(e) => field.onChange(e.nativeEvent.text)}
      />
      {fieldState.error && (
        <HelperText type="error">{fieldState.error?.message}</HelperText>
      )}
    </View>
  );
};
export default FormField;
