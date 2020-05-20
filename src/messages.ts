enum SessionMessages {
    USER_NOT_FOUND = 'Username or Password is incorrect!',
    NOT_A_VALID_EMAIL = 'Email ID is not valid!',
    NOT_A_VALID_USERNAME = 'Username is not valid!',
    EMAIL_EXIST = 'Email already exist!',
    EMAIL_AVAILABLE = 'Email available!',
    USERNAME_EXIST = 'Username already exist!',
    USERNAME_AVAILABLE = 'Username available!',
    NO_AUTH = 'Not Authorized!',
    CANT_PROCESS = 'Cannot Process!',
    INTERNAL_SERVER_ERROR = 'Internal Server Error!',
    SIGNUP_FAILED = 'Registration Failed!',
    FORGOT_PASSWORD = 'Password Reset mail has been sent!',
    CHANGE_PASSWORD = 'Password has been Reset!',
    PASSWORD_DOES_NOT_MATCH = 'Passwords does not match!',
    RESET_PASSWORD_TOKEN_NOT_VALID = 'Reset Passwword token is not valid!',
    USER_DEACTIVATED = 'Account Successfully Deactivated!',
    INPUT_NOT_VALID = "Provided Input is not valid!",
}

enum IngredientMessages {
    INGREDEINT_WITH_CODE_EXIST = "Ingredient with provided code already exists!",
    NO_INGREDEINT_WITH_CODE_EXIST = "Ingredient with provided code does not exists!",
    VENDOR_NOT_AVAILBLE = "Vendor is not valid!",
    CREATED = "Ingredient created successfully!",
    UPDATE_MANY = "Ingredients updated successfully!",
    UPDATE_ONE = "Ingredient updated successfully!",
    DELETE_ONE = "Ingredient deleted successfully!",
    NO_ENTRIES_FOUND = "No Ingredient Entries found!"
}

enum VendorMessages {
    VENDOR_WITH_CODE_EXIST = "Vendor with provided code already exists!",
    NO_VENDOR_WITH_CODE_EXIST = "Vendor with provided code does not exists!",
    CREATED = "Vendor created successfully!",
    UPDATE_MANY = "Vendors updated successfully!",
    UPDATE_ONE = "Vendor updated successfully!",
    DELETE_ONE = "Vendor deleted successfully!",
    NO_ENTRIES_FOUND = "No Vendor Entries found!"
}

enum FoodMessages {
    FOOD_WITH_CODE_EXIST = "Food with provided code already exists!",
    NO_FOOD_WITH_CODE_EXIST = "Food with provided code does not exists!",
    NO_FOOD_WITH_NAME_EXIST = "Food with provided name does not exists!",
    CREATED = "Food created successfully!",
    UPDATE_MANY = "Foods updated successfully!",
    UPDATE_ONE = "Food updated successfully!",
    DELETE_ONE = "Food deleted successfully!",
    NO_ENTRIES_FOUND = "No Food Entries found!"
}

enum OrderMessages {
    NO_SUFFICIENT_INGREDIENTS_AVAILABLE = "Sufficient amount of ingredients are not avaialble to place the order!",
    CREATED = "Order placed successfully!",
    USER_NOT_FOUND = "User not Found!",
    NO_ENTRIES_FOUND = "No Orders found!",
    NO_ORDER_EXIST = "Order with provided ID does not exists!",
    ORDER_DELIVERED = "Sorry you cannot cancel this order, it is already delivered!",
    ORDER_CANCELLED = "Your order has been cancelled!",
}

export { SessionMessages as Messages, IngredientMessages, VendorMessages, FoodMessages, OrderMessages }