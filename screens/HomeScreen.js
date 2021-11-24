import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import tw from "tailwind-rn";
import { Ionicons, AntDesign, Entypo } from "@expo/vector-icons";
import useAuth from "../hooks/useAuth";
import Swiper from "react-native-deck-swiper";
import { db } from "../firebase";
import {
  onSnapshot,
  doc,
  collection,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import generateId from "../lib/generateId";

const DUMMY_DATA = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    occupation: "Programmer",
    photoURL:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
    age: 30,
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Doe",
    occupation: "Lawyer",
    photoURL: "https://pbs.twimg.com/media/D8dDZukXUAAXLdY.jpg",
    age: 25,
  },
  {
    id: 3,
    firstName: "Test",
    lastName: "Person",
    occupation: "Doctor",
    photoURL: "https://i1.sndcdn.com/avatars-000339084123-nag0p1-t500x500.jpg",
    age: 30,
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const swipeRef = useRef(null);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    let unsub;

    const fetchCards = async () => {
      const passes = await getDocs(
        collection(db, "users", user.uid, "passes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const swipes = await getDocs(
        collection(db, "users", user.uid, "swipes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const passedUserIds = passes.length > 0 ? passes : ["test"];
      const swipedUserIds = swipes.length > 0 ? swipes : ["test"];

      unsub = onSnapshot(
        query(
          collection(db, "users"),
          where("id", "not-in", [...passedUserIds, ...swipedUserIds])
        ),
        (snapshot) => {
          setProfiles(
            snapshot.docs
              .filter((doc) => doc.id !== user.uid)
              .map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        }
      );
    };

    fetchCards();
    return unsub;
  }, []);

  useLayoutEffect(
    () =>
      onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (!snapshot.exists()) {
          navigation.navigate("Modal");
        }
      }),
    []
  );

  const swipeLeft = async (cardIndex) => {
    if (!profiles[cardIndex]) return;
    const userSwiped = profiles[cardIndex];
    console.log(`You swiped PASS on ${userSwiped.displayName}`);

    setDoc(doc(db, "users", user.uid, "passes", userSwiped.id), userSwiped);
  };

  const swipeRight = async (cardIndex) => {
    if (!profiles[cardIndex]) return;
    const userSwiped = profiles[cardIndex];
    console.log("i'm here");
    const loggedInProfileTemp = await getDoc(doc(db, "users", user.uid));
    const loggedInProfile = await loggedInProfileTemp.data();
    console.log(loggedInProfile);
    // check if user swiped on you
    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          // user already swiped on you
          // create a match
          console.log(`You MATCHED with ${userSwiped.displayName}`);
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );

          // create a match
          setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid]: loggedInProfile,
              [userSwiped.id]: userSwiped,
            },
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          });

          navigation.navigate("Match", {
            loggedInProfile,
            userSwiped,
          });
        } else {
          console.log(
            `You swiped on ${userSwiped.displayName} (${userSwiped.job})`
          );
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );
        }
      }
    );
  };

  return (
    <SafeAreaView style={tw("flex-1")}>
      {/* Header */}
      <View style={tw("flex-row items-center justify-between px-5")}>
        <TouchableOpacity onPress={logout}>
          <Image
            style={tw("h-10 w-10 rounded-full")}
            source={{ uri: user.photoURL }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
          <Image
            style={tw("h-14 w-14")}
            source={{
              uri: "https://uxwing.com/wp-content/themes/uxwing/download/10-brands-and-social-media/tinder.png",
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color="#FE5864" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View style={tw("flex-1 -mt-6")}>
        <Swiper
          ref={swipeRef}
          cards={profiles}
          stackSize={5}
          cardIndex={0}
          onSwipedLeft={(cardIndex) => {
            console.log("Swipe pass");
            swipeLeft(cardIndex);
          }}
          onSwipedRight={(cardIndex) => {
            console.log("Swipe match");
            swipeRight(cardIndex);
          }}
          verticalSwipe={false}
          backgroundColor="#4fd0E9"
          containerStyle={{ backgroundColor: "transparent" }}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: { label: { textAlign: "right", color: "red" } },
            },
            right: {
              title: "MATCH",
              style: { label: { color: "#4ded30" } },
            },
          }}
          renderCard={(card) =>
            card ? (
              <View
                key={card.id}
                style={tw("bg-white h-3/4 rounded-xl relative")}
              >
                <Image
                  style={tw("h-full top-0 w-full rounded-xl")}
                  source={{ uri: card.photoURL }}
                />
                <View
                  style={[
                    tw(
                      "absolute bottom-0 bg-white w-full flex-row justify-between items-center h-20 px-6 py-2 rounded-b-xl"
                    ),
                    styles.cardShadow,
                  ]}
                >
                  <View>
                    <Text style={tw("text-xl font-bold")}>
                      {card.displayName}
                    </Text>
                    <Text>{card.job}</Text>
                  </View>
                  <Text style={tw("text-2xl font-bold")}>{card.age}</Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  tw(
                    "relative bg-white h-3/4 rounded-xl justify-center items-center"
                  ),
                  styles.cardShadow,
                ]}
              >
                <Text style={tw("font-bold pb-5")}>No more profiles</Text>
                <Image
                  style={tw("h-20 w-full")}
                  height={100}
                  width={100}
                  source={{ uri: "https://links.papareact.com/6gb" }}
                />
              </View>
            )
          }
        />
      </View>

      <View style={tw("flex-row flex justify-evenly")}>
        <TouchableOpacity
          onPress={() => swipeRef.current.swipeLeft()}
          style={tw(
            "items-center justify-center rounded-full w-16 h-16 bg-red-200"
          )}
        >
          <Entypo name="cross" size={24} color="red" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swipeRef.current.swipeRight()}
          style={tw(
            "items-center justify-center rounded-full w-16 h-16 bg-green-200"
          )}
        >
          <Entypo name="heart" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});

export default HomeScreen;
