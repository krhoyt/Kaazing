
public interface GatewayListener {

	void onConnect();
	void onDisconnect();
	void onError( String message );
	void onMessage( String message );
	void onSubscribe();
	void onUnsubscribe();
	
}
