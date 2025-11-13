// user Deleteion

import { Alert } from "react-native";

import FetchHelper from "../utils/fetchHelper";

import SessionManager from "../utils/SessionManager";

import UserSignout from "../utils/userSignout";
 
class UserDelete {

  static async deleteAccount(navigation) {

    Alert.alert(

      "Confirm Deletion",

      "Are you sure you want to permanently delete your account? This cannot be undone.",

      [

        { text: "Cancel", style: "cancel" },

        {

          text: "Delete",

          style: "destructive",

          onPress: async () => {

            try {

              const tokenManager = new SessionManager("JWT_TOKEN");

              const token = await tokenManager.getToken();
 
              const headers = {

                "Content-Type": "application/json",

                Authorization: token,

              };
 
              // Adjust the API endpoint if needed

              const response = await FetchHelper.makeRequest(

                "http://10.0.2.2:3000/user/",

                "DELETE",

                headers

              );
 
              if (response.ok) {

                Alert.alert("Account Deleted", "Your account has been removed.");

                await UserSignout.signoutUser(navigation);

              } else {

                const errorData = await response.json();

                Alert.alert(

                  "Error",

                  errorData.message || "Failed to delete your account."

                );

              }

            } catch (error) {

              console.log("Error deleting account:", error);

              Alert.alert("Error", "An unexpected error occurred.");

            }

          },

        },

      ]

    );

  }

}
 
export default UserDelete;

 