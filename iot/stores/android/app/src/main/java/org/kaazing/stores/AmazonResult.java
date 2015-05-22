package org.kaazing.stores;

public class AmazonResult {
	private float	price = 0;
	private String	image = null;
	private String	title = null;
	private String	upc = null;
	
	public AmazonResult( String title, String image, String upc, float price ) {
		setTitle( title );
		setImage( image );
		setUpc( upc );
		setPrice( price );
	}
	
	public AmazonResult( String title, String image ) {
		this( title, image, null, 0 );
	}
	
	public AmazonResult( String upc ) {
		this( null, null, upc, 0 );
	}
	
	public AmazonResult() {
		this( null, null, null, 0 );
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getUpc() {
		return upc;
	}

	public void setUpc(String upc) {
		this.upc = upc;
	}

	public float getPrice() {
		return price;
	}

	public void setPrice(float price) {
		this.price = price;
	}
}
