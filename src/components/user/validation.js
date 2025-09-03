import * as Yup from "yup";

export const searchValidationSchema = Yup.object({
  from: Yup.string().required("Origin city is required"),
  to: Yup.string()
    .required("Destination city is required")
    .notOneOf([Yup.ref("from"), null], "Origin and destination cannot be the same"),
});

export const getPassengerValidationSchema = (selectedCount) =>
  Yup.object({
    passengers: Yup.array()
      .of(
        Yup.object({
          name: Yup.string().required("Required"),
          age: Yup.number()
            .typeError("Required")
            .positive("Must be positive")
            .integer("Must be integer")
            .required("Required"),
          gender: Yup.string()
            .oneOf(["male", "female", "other"], "Required")
            .required("Required"),
        })
      )
      .min(selectedCount, "Must fill all passengers"),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Must be a valid 10-digit mobile")
      .required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
  });
