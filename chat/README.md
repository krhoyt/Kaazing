Chat
===

Chat is the "hello world" for real-time software.  Developing such an example gives you insight to how connections are made, how data is send, how data is received, error handling, and more.  Most developers will approach this problem from a single stack, the one most familiar, but consumers of the end project will likely need support for more platforms than just that given stack.

Kaazing Gateway supports multiple client technologies, and various protocols with which to achieve real-time communication.  This gives developers a broad reach 

Web
===

An example built using Web Standards.  This was the first completed example, and has set the baseline functionality and appearance of the others.  A live and running example is available to use without any download or installation, and available across devices.

It is worth noting that "gateway.js" effectively provides a library wrapper around the various Kaazing Gateway parts and pieces needed to make real-time chat a reality.  Part of this library wrapper is a basic chat client functionality.  The goal is to abstract complexity and minimize the effort needed to explore real-time features.

Java
===

This is a Java Swing desktop client that mirrors the Web example.  It is designed to be run on the desktop.  The README file in that project folder includes links to access the necessary Java libraries (JAR files) for Kaazing Gateway functionality.  Unlike the Web example, there is no library wrapper.

Android
===

An Android Java application which participates on the same topic as the Java and Web versions of the application.  This allows all three platforms to participate in a chat.  Much of the logic for the Android version is borrowed from the Java Swing version, but there is no concise library wrapper.

Swift
===

User interface completed.  Connectivity not yet implemented.
